using Application.Common;
using Application.DTOs;
using Application.Features.Cart.Commands;
using Application.Interfaces;
using Domain.Entities;
using Domain.Exceptions;
using MediatR;
using WishlistEntity = Domain.Entities.Wishlist;

namespace Application.Features.Wishlist.Commands;

public record ToggleWishlistCommand(Guid ProductId) : IRequest<Result<WishlistToggleResponse>>;

public class WishlistToggleResponse
{
    public bool IsInWishlist { get; set; }
    public WishlistItemDto? Item { get; set; }
}

public class ToggleWishlistCommandHandler : IRequestHandler<ToggleWishlistCommand, Result<WishlistToggleResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public ToggleWishlistCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<WishlistToggleResponse>> Handle(ToggleWishlistCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException();

        var wishlist = (await _context.Wishlists
            .GetByExpressionAsync(w => w.UserId == userId, cancellationToken))
            .FirstOrDefault();

        if (wishlist == null)
        {
            wishlist = new WishlistEntity { Id = Guid.NewGuid(), UserId = userId };
            await _context.Wishlists.AddAsync(wishlist, cancellationToken);
            await _context.UnitOfWork.SaveChangesAsync(cancellationToken);
        }

        var existingItem = (await _context.WishlistItems
            .GetByExpressionAsync(wi => wi.WishlistId == wishlist.Id && wi.ProductId == request.ProductId, cancellationToken))
            .FirstOrDefault();

        if (existingItem != null)
        {
            await _context.WishlistItems.DeleteAsync(existingItem, cancellationToken);
            await _context.UnitOfWork.SaveChangesAsync(cancellationToken);
            return Result<WishlistToggleResponse>.SuccessResult(new WishlistToggleResponse { IsInWishlist = false });
        }

        var product = await _context.Products.GetByIdAsync(request.ProductId, cancellationToken)
            ?? throw new NotFoundException("Product", request.ProductId);

        var newItem = new WishlistItem { Id = Guid.NewGuid(), WishlistId = wishlist.Id, ProductId = product.Id };
        await _context.WishlistItems.AddAsync(newItem, cancellationToken);
        await _context.UnitOfWork.SaveChangesAsync(cancellationToken);

        var primaryImage = product.Images.FirstOrDefault(i => i.IsPrimary) ?? product.Images.FirstOrDefault();

        return Result<WishlistToggleResponse>.SuccessResult(new WishlistToggleResponse
        {
            IsInWishlist = true,
            Item = new WishlistItemDto
            {
                Id = newItem.Id,
                ProductId = product.Id,
                ProductName = product.Name,
                ProductSlug = product.Slug,
                ProductImage = primaryImage?.Url ?? "",
                Price = product.Price,
                OriginalPrice = product.OriginalPrice,
                IsInStock = product.Stock > 0,
                AddedAt = newItem.CreatedAt
            }
        });
    }
}
