using Application.Common;
using Application.Interfaces;
using Domain.Exceptions;
using MediatR;

namespace Application.Features.Wishlist.Commands;

public record RemoveFromWishlistCommand(Guid ProductId) : IRequest<Result>;

public class RemoveFromWishlistCommandHandler : IRequestHandler<RemoveFromWishlistCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public RemoveFromWishlistCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(RemoveFromWishlistCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException();

        var wishlist = (await _context.Wishlists
            .GetByExpressionAsync(w => w.UserId == userId, cancellationToken))
            .FirstOrDefault() ?? throw new NotFoundException("Wishlist", userId);

        var item = (await _context.WishlistItems
            .GetByExpressionAsync(wi => wi.WishlistId == wishlist.Id && wi.ProductId == request.ProductId, cancellationToken))
            .FirstOrDefault() ?? throw new NotFoundException("Wishlist item", request.ProductId);

        await _context.WishlistItems.DeleteAsync(item, cancellationToken);
        await _context.UnitOfWork.SaveChangesAsync(cancellationToken);

        return Result.SuccessResult("Item removed from wishlist.");
    }
}
