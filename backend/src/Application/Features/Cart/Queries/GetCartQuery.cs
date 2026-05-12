using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
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

        var productIds = cartItems.Select(ci => ci.ProductId).Distinct().ToList();
        var products = await _context.ProductsWithIncludes
            .Include(p => p.Images)
            .Where(p => productIds.Contains(p.Id))
            .ToListAsync(ct);

        var productDict = products.ToDictionary(p => p.Id);

        var variantIds = cartItems.Where(ci => ci.VariantId.HasValue).Select(ci => ci.VariantId.Value).Distinct().ToList();
        var variants = variantIds.Any()
            ? (await _context.ProductVariants.GetByExpressionAsync(v => variantIds.Contains(v.Id), ct))
                .ToDictionary(v => v.Id)
            : new Dictionary<Guid, ProductVariant>();

        var items = new List<CartItemDto>();
        decimal subtotal = 0;
        int totalItems = 0;

        foreach (var ci in cartItems)
        {
            if (!productDict.TryGetValue(ci.ProductId, out var product)) continue;

            string variantAttrs = null;
            if (ci.VariantId.HasValue && variants.TryGetValue(ci.VariantId.Value, out var variant))
            {
                variantAttrs = variant.Attributes;
            }

            var itemDto = new CartItemDto
            {
                Id = ci.Id,
                ProductId = ci.ProductId,
                ProductName = product.Name,
                ProductSlug = product.Slug,
                ProductImage = product.Images.OrderBy(i => i.Order).FirstOrDefault(i => i.IsPrimary)?.Url
                    ?? product.Images.OrderBy(i => i.Order).FirstOrDefault()?.Url
                    ?? "",
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
