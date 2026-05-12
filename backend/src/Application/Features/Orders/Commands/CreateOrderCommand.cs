using Application.Common;
using Application.DTOs;
using Application.Features.Cart.Commands;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Application.Features.Orders.Commands;

public record CreateOrderCommand(
    ShippingAddressDto ShippingAddress,
    string PaymentMethod,
    string? CouponCode = null,
    string? Notes = null) : IRequest<Result<OrderDto>>;

public class ShippingAddressDto
{
    public string FullName { get; set; } = string.Empty;
    public string AddressLine1 { get; set; } = string.Empty;
    public string? AddressLine2 { get; set; }
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Result<OrderDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IPaymentGatewayService _paymentGateway;

    public CreateOrderCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IPaymentGatewayService paymentGateway)
    {
        _context = context;
        _currentUser = currentUser;
        _paymentGateway = paymentGateway;
    }

    public async Task<Result<OrderDto>> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException();

        var cart = (await _context.Carts
            .GetByExpressionAsync(c => c.UserId == userId, cancellationToken))
            .FirstOrDefault();

        var cartItems = await _context.CartItems.GetByExpressionAsync(ci => ci.CartId == cart.Id, cancellationToken);

        if (cart == null || !cartItems.Any())
            return Result<OrderDto>.FailureResult("Cart is empty.");

        // Load all products with images in one query
        var productIds = cartItems.Select(ci => ci.ProductId).Distinct().ToList();
        var products = await _context.ProductsWithIncludes
            .Include(p => p.Images)
            .Where(p => productIds.Contains(p.Id))
            .ToListAsync(cancellationToken);

        var productDict = products.ToDictionary(p => p.Id);

        decimal subtotal = 0;
        var orderItems = new List<OrderItem>();

        foreach (var ci in cartItems)
        {
            if (!productDict.TryGetValue(ci.ProductId, out var product) || !product.IsActive)
                return Result<OrderDto>.FailureResult($"Product '{ci.ProductId}' is no longer available.");

            if (product.Stock < ci.Quantity)
                return Result<OrderDto>.FailureResult($"Product '{product.Name}' has insufficient stock.");

            var primaryImage = product.Images.OrderBy(i => i.Order).FirstOrDefault(i => i.IsPrimary)
                ?? product.Images.OrderBy(i => i.Order).FirstOrDefault();

            string? variantAttrs = null;
            if (ci.VariantId.HasValue)
            {
                var variant = await _context.ProductVariants.GetByIdAsync(ci.VariantId.Value, cancellationToken);
                if (variant == null || variant.Stock < ci.Quantity)
                    return Result<OrderDto>.FailureResult("Selected variant is not available.");
                variantAttrs = variant.Attributes;
            }

            var orderItem = new OrderItem
            {
                Id = Guid.NewGuid(),
                ProductId = product.Id,
                VariantId = ci.VariantId,
                ProductName = product.Name,
                ProductImage = primaryImage?.Url ?? "",
                VariantAttributes = variantAttrs,
                Quantity = ci.Quantity,
                Price = ci.Price,
                Subtotal = ci.Price * ci.Quantity
            };

            orderItems.Add(orderItem);
            subtotal += orderItem.Subtotal;

            // Deduct stock
            product.Stock -= ci.Quantity;
            if (ci.VariantId.HasValue)
            {
                var variant = await _context.ProductVariants.GetByIdAsync(ci.VariantId.Value, cancellationToken);
                if (variant != null) variant.Stock -= ci.Quantity;
            }
        }

        decimal discount = 0;
        Guid? couponId = null;

        if (!string.IsNullOrEmpty(request.CouponCode))
        {
            var coupon = (await _context.Coupons
                .GetByExpressionAsync(c => c.Code == request.CouponCode && c.IsActive && c.ValidFrom <= DateTime.UtcNow && c.ValidTo >= DateTime.UtcNow, cancellationToken))
                .FirstOrDefault();

            if (coupon == null)
                return Result<OrderDto>.FailureResult("Invalid or expired coupon code.");

            if (coupon.MinOrderAmount.HasValue && subtotal < coupon.MinOrderAmount.Value)
                return Result<OrderDto>.FailureResult($"Minimum order amount for this coupon is {coupon.MinOrderAmount.Value}.");

            if (coupon.UsageLimit.HasValue && coupon.UsedCount >= coupon.UsageLimit.Value)
                return Result<OrderDto>.FailureResult("Coupon usage limit reached.");

            discount = coupon.DiscountType == DiscountType.Percentage
                ? Math.Round(subtotal * coupon.DiscountValue / 100, 2)
                : coupon.DiscountValue;

            if (coupon.MaxDiscountAmount.HasValue && discount > coupon.MaxDiscountAmount.Value)
                discount = coupon.MaxDiscountAmount.Value;

            coupon.UsedCount++;
            couponId = coupon.Id;

            var couponUsage = new CouponUsage { Id = Guid.NewGuid(), CouponId = coupon.Id, UserId = userId };
            await _context.CouponUsages.AddAsync(couponUsage, cancellationToken);
        }

        var tax = Math.Round((subtotal - discount) * 0.1m, 2);
        var shipping = (subtotal - discount) > 50 ? 0 : 5.99m;
        var total = subtotal - discount + tax + shipping;

        var orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(1000, 9999)}";

        // Process payment through gateway
        var paymentRequest = new PaymentRequest
        {
            OrderNumber = orderNumber,
            Amount = total,
            Currency = "USD",
            PaymentMethod = request.PaymentMethod,
            WalletId = request.PaymentMethod == "wallet" ? userId.ToString() : null,
            Description = $"Payment for order {orderNumber}"
        };

        var paymentResult = await _paymentGateway.ProcessPaymentAsync(paymentRequest, cancellationToken);

        var paymentStatus = paymentResult.Success ? PaymentStatus.Paid : PaymentStatus.Failed;
        var orderStatus = paymentResult.Success ? OrderStatus.Pending : OrderStatus.Cancelled;
        string? transactionId = paymentResult.Success ? paymentResult.TransactionId : null;

        if (!paymentResult.Success)
        {
            return Result<OrderDto>.FailureResult($"Payment failed: {paymentResult.Message}");
        }

        var order = new Order
        {
            Id = Guid.NewGuid(),
            OrderNumber = orderNumber,
            UserId = userId,
            Subtotal = subtotal,
            Discount = discount,
            Tax = tax,
            Shipping = shipping,
            Total = total,
            Status = orderStatus,
            PaymentStatus = paymentStatus,
            PaymentMethod = request.PaymentMethod,
            PaymentTransactionId = transactionId,
            ShippingAddress = JsonSerializer.Serialize(request.ShippingAddress),
            Notes = request.Notes,
            CouponId = couponId
        };

        await _context.Orders.AddAsync(order, cancellationToken);

        foreach (var item in orderItems)
        {
            item.OrderId = order.Id;
            await _context.OrderItems.AddAsync(item, cancellationToken);
        }

        // Clear cart
        foreach (var ci in cartItems)
        {
            await _context.CartItems.DeleteAsync(ci, cancellationToken);
        }

        await _context.UnitOfWork.SaveChangesAsync(cancellationToken);

        return Result<OrderDto>.SuccessResult(MapToDto(order), $"Order created successfully. Transaction: {transactionId}");
    }

    private OrderDto MapToDto(Order order) => new()
    {
        Id = order.Id,
        OrderNumber = order.OrderNumber,
        Subtotal = order.Subtotal,
        Discount = order.Discount,
        Tax = order.Tax,
        Shipping = order.Shipping,
        Total = order.Total,
        Status = order.Status.ToString(),
        PaymentStatus = order.PaymentStatus.ToString(),
        PaymentMethod = order.PaymentMethod,
        PaymentTransactionId = order.PaymentTransactionId,
        ShippingAddress = order.ShippingAddress,
        TrackingNumber = order.TrackingNumber,
        Notes = order.Notes,
        CreatedAt = order.CreatedAt
    };
}
