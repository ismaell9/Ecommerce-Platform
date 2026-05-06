using Application.Common;
using Application.DTOs;
using Application.Features.Cart.Queries;
using Application.Interfaces;
using Domain.Exceptions;
using MediatR;

namespace Application.Features.Cart.Commands;

public record UpdateCartItemCommand(Guid ItemId, int Quantity) : IRequest<Result<CartDto>>;

public class UpdateCartItemCommandHandler : IRequestHandler<UpdateCartItemCommand, Result<CartDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public UpdateCartItemCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<CartDto>> Handle(UpdateCartItemCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException();

        var cartItem = await _context.CartItems.GetByIdAsync(request.ItemId, cancellationToken)
            ?? throw new NotFoundException("Cart item", request.ItemId);

        var cart = await _context.Carts.GetByIdAsync(cartItem.CartId, cancellationToken);
        if (cart?.UserId != userId)
            throw new UnauthorizedAccessException();

        if (request.Quantity <= 0)
        {
            await _context.CartItems.DeleteAsync(cartItem, cancellationToken);
        }
        else
        {
            cartItem.Quantity = request.Quantity;
        }

        await _context.UnitOfWork.SaveChangesAsync(cancellationToken);

        var cartQueryHandler = new GetCartQueryHandler(_context, _currentUser);
        return Result<CartDto>.SuccessResult(await cartQueryHandler.Handle(new GetCartQuery(), cancellationToken));
    }
}
