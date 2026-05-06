using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Exceptions;
using MediatR;
using CartEntity = Domain.Entities.Cart;

namespace Application.Features.Cart.Queries;

public record GetCartQuery : IRequest<CartDto>;

public class GetCartQueryHandler : IRequestHandler<GetCartQuery, CartDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetCartQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<CartDto> Handle(GetCartQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException();

        var cart = (await _context.Carts
            .GetByExpressionAsync(c => c.UserId == userId, cancellationToken))
            .FirstOrDefault();

        if (cart == null)
        {
            cart = new CartEntity { Id = Guid.NewGuid(), UserId = userId };
            await _context.Carts.AddAsync(cart, cancellationToken);
            await _context.UnitOfWork.SaveChangesAsync(cancellationToken);
        }

        return await BuildCartDto(cart.Id, cancellationToken);
    }

    public async Task<CartDto> BuildCartDto(Guid cartId, CancellationToken ct)
    {
        var cartItems = await _context.CartItems.GetByExpressionAsync(ci => ci.CartId == cartId, ct);

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
                Subtotal = ci.Price * ci.Quantity
            };

            items.Add(itemDto);
            subtotal += itemDto.Subtotal;
            totalItems += ci.Quantity;
        }

        var tax = Math.Round(subtotal * 0.1m, 2);
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
