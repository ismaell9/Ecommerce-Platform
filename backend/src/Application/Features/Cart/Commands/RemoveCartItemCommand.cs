using Application.Common;
using Application.Interfaces;
using Domain.Exceptions;
using MediatR;

namespace Application.Features.Cart.Commands;

public record RemoveCartItemCommand(Guid ItemId) : IRequest<Result>;

public class RemoveCartItemCommandHandler : IRequestHandler<RemoveCartItemCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public RemoveCartItemCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(RemoveCartItemCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException();

        var cartItem = await _context.CartItems.GetByIdAsync(request.ItemId, cancellationToken)
            ?? throw new NotFoundException("Cart item", request.ItemId);

        var cart = await _context.Carts.GetByIdAsync(cartItem.CartId, cancellationToken);
        if (cart?.UserId != userId)
            throw new UnauthorizedAccessException();

        await _context.CartItems.DeleteAsync(cartItem, cancellationToken);
        await _context.UnitOfWork.SaveChangesAsync(cancellationToken);

        return Result.SuccessResult("Item removed from cart.");
    }
}
