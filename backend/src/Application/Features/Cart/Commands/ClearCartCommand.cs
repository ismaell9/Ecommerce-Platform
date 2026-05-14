using Application.Common;
using Application.Interfaces;
using MediatR;

namespace Application.Features.Cart.Commands;

public record ClearCartCommand : IRequest<Result>;

public class ClearCartCommandHandler : IRequestHandler<ClearCartCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public ClearCartCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(ClearCartCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException();

        var cart = (await _context.Carts
            .GetByExpressionAsync(c => c.UserId == userId, cancellationToken))
            .FirstOrDefault();

        if (cart == null)
            return Result.SuccessResult("Cart is already empty.");

        var items = await _context.CartItems
            .GetByExpressionAsync(ci => ci.CartId == cart.Id, cancellationToken);

        foreach (var item in items)
        {
            await _context.CartItems.DeleteAsync(item, cancellationToken);
        }

        await _context.UnitOfWork.SaveChangesAsync(cancellationToken);

        return Result.SuccessResult("Cart cleared successfully.");
    }
}
