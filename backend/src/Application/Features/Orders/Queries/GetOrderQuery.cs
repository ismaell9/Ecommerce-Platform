using Application.Common;
using Application.DTOs;
using Application.Interfaces;
using Domain.Exceptions;
using MediatR;

namespace Application.Features.Orders.Queries;

public record GetOrderQuery(Guid Id) : IRequest<Result<OrderDto>>;

public class GetOrderQueryHandler : IRequestHandler<GetOrderQuery, Result<OrderDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetOrderQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<OrderDto>> Handle(GetOrderQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException();

        var order = await _context.Orders.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Order", request.Id);

        if (order == null)
            return Result<OrderDto>.FailureResult("Order not found.");

        if (order.UserId != userId && !_currentUser.IsInRole("Admin"))
            return Result<OrderDto>.FailureResult("Order not found.");

        var dto = new OrderDto
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

        var items = await _context.OrderItems.GetByExpressionAsync(i => i.OrderId == order.Id, cancellationToken);
        dto.Items = items.Select(i => new OrderItemDto
        {
            Id = i.Id,
            ProductId = i.ProductId,
            ProductName = i.ProductName,
            ProductImage = i.ProductImage,
            VariantAttributes = i.VariantAttributes,
            Quantity = i.Quantity,
            Price = i.Price,
            Subtotal = i.Subtotal
        }).ToList();

        return Result<OrderDto>.SuccessResult(dto);
    }
}
