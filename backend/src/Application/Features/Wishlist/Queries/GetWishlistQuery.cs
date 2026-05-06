using Application.Interfaces;
using Domain.Entities;
using Domain.Exceptions;
using MediatR;
using WishlistEntity = Domain.Entities.Wishlist;

namespace Application.Features.Wishlist.Queries;

public record GetWishlistQuery : IRequest<WishlistDto>;

public class WishlistDto
{
    public Guid Id { get; set; }
    public List<WishlistItemDto> Items { get; set; } = new();
    public int TotalItems { get; set; }
}

public class WishlistItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductSlug { get; set; } = string.Empty;
    public string ProductImage { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public bool IsInStock { get; set; }
    public DateTime AddedAt { get; set; }
}

public class GetWishlistQueryHandler : IRequestHandler<GetWishlistQuery, WishlistDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetWishlistQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<WishlistDto> Handle(GetWishlistQuery request, CancellationToken cancellationToken)
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
            return new WishlistDto { Id = wishlist.Id };
        }

        var items = await _context.WishlistItems.GetByExpressionAsync(
            wi => wi.WishlistId == wishlist.Id, cancellationToken);

        var itemDtos = new List<WishlistItemDto>();
        foreach (var wi in items.OrderByDescending(wi => wi.CreatedAt))
        {
            var product = await _context.Products.GetByIdAsync(wi.ProductId, cancellationToken);
            if (product == null) continue;

            var primaryImage = product.Images.FirstOrDefault(i => i.IsPrimary) ?? product.Images.FirstOrDefault();

            itemDtos.Add(new WishlistItemDto
            {
                Id = wi.Id,
                ProductId = product.Id,
                ProductName = product.Name,
                ProductSlug = product.Slug,
                ProductImage = primaryImage?.Url ?? "",
                Price = product.Price,
                OriginalPrice = product.OriginalPrice,
                IsInStock = product.Stock > 0,
                AddedAt = wi.CreatedAt
            });
        }

        return new WishlistDto
        {
            Id = wishlist.Id,
            Items = itemDtos,
            TotalItems = itemDtos.Count
        };
    }
}
