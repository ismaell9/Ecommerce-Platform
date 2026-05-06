using Application.Common;
using Application.DTOs;
using Application.Features.Products.Queries;
using Application.Interfaces;
using Domain.Entities;
using Domain.Exceptions;
using MediatR;
using CartEntity = Domain.Entities.Cart;

namespace Application.Features.Cart.Commands;

public record AddToCartCommand(
    Guid ProductId,
    int Quantity,
    Guid? VariantId = null) : IRequest<Result<CartDto>>;

public class AddToCartCommandHandler : IRequestHandler<AddToCartCommand, Result<CartDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public AddToCartCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<CartDto>> Handle(AddToCartCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException();

        var product = await _context.Products.GetByIdAsync(request.ProductId, cancellationToken)
            ?? throw new NotFoundException("Product", request.ProductId);

        if (!product.IsActive)
            return Result<CartDto>.FailureResult("Product is not available.");

        var cart = (await _context.Carts
            .GetByExpressionAsync(c => c.UserId == userId, cancellationToken))
            .FirstOrDefault();

        if (cart == null)
        {
            cart = new CartEntity { Id = Guid.NewGuid(), UserId = userId };
            await _context.Carts.AddAsync(cart, cancellationToken);
            await _context.UnitOfWork.SaveChangesAsync(cancellationToken);
        }

        var existingItem = (await _context.CartItems
            .GetByExpressionAsync(ci => ci.CartId == cart.Id && ci.ProductId == request.ProductId && ci.VariantId == request.VariantId, cancellationToken))
            .FirstOrDefault();

        if (existingItem != null)
        {
            existingItem.Quantity += request.Quantity;
            await _context.UnitOfWork.SaveChangesAsync(cancellationToken);
        }
        else
        {
            var price = request.VariantId.HasValue
                ? (await _context.ProductVariants.GetByIdAsync(request.VariantId.Value, cancellationToken))?.Price ?? product.Price
                : product.Price;

            var cartItem = new CartItem
            {
                Id = Guid.NewGuid(),
                CartId = cart.Id,
                ProductId = product.Id,
                VariantId = request.VariantId,
                Quantity = request.Quantity,
                Price = price
            };
            await _context.CartItems.AddAsync(cartItem, cancellationToken);
            await _context.UnitOfWork.SaveChangesAsync(cancellationToken);
        }

        return Result<CartDto>.SuccessResult(await GetCartDto(cart.Id, cancellationToken));
    }

    private async Task<CartDto> GetCartDto(Guid cartId, CancellationToken ct)
    {
        var cartItems = await _context.CartItems.GetByExpressionAsync(
            ci => ci.CartId == cartId, ct);

        var items = new List<CartItemDto>();
        decimal subtotal = 0;
        int totalItems = 0;

        foreach (var ci in cartItems)
        {
            var product = await _context.Products.GetByIdAsync(ci.ProductId, ct);
            if (product == null) continue;

            var variantAttrs = ci.VariantId.HasValue
                ? (await _context.ProductVariants.GetByIdAsync(ci.VariantId.Value, ct))?.Attributes
                : null;

            var itemDto = new CartItemDto
            {
                Id = ci.Id,
                ProductId = ci.ProductId,
                ProductName = product.Name,
                ProductSlug = product.Slug,
                ProductImage = product.Images.FirstOrDefault(i => i.IsPrimary)?.Url ?? product.Images.FirstOrDefault()?.Url ?? "",
                VariantId = ci.VariantId,
                VariantAttributes = variantAttrs != null ? System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(variantAttrs) : null,
                Quantity = ci.Quantity,
                Price = ci.Price,
                OriginalPrice = ci.Price,
                Subtotal = ci.Price * ci.Quantity
            };

            items.Add(itemDto);
            subtotal += itemDto.Subtotal;
            totalItems += ci.Quantity;
        }

        var tax = subtotal * 0.1m; // 10% tax
        var shipping = subtotal > 50 ? 0 : 5.99m;

        return new CartDto
        {
            Id = cartId,
            Items = items,
            TotalItems = totalItems,
            Subtotal = subtotal,
            Tax = tax,
            Shipping = shipping,
            Total = subtotal + tax + shipping
        };
    }
}
