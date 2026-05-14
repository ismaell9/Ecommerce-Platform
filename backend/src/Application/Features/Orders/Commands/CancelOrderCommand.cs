using Application.Common;
using Application.Interfaces;
using Domain.Enums;
using Domain.Exceptions;
using MediatR;

namespace Application.Features.Orders.Commands;

public record CancelOrderCommand(Guid OrderId) : IRequest<Result>;

public class CancelOrderCommandHandler : IRequestHandler<CancelOrderCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IPaymentGatewayService _paymentGateway;

    public CancelOrderCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IPaymentGatewayService paymentGateway)
    {
        _context = context;
        _currentUser = currentUser;
        _paymentGateway = paymentGateway;
    }

    public async Task<Result> Handle(CancelOrderCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException();

        var order = await _context.Orders.GetByIdAsync(request.OrderId, cancellationToken)
            ?? throw new NotFoundException("Order", request.OrderId);

        if (order == null)
            return Result.FailureResult("Order not found.");

        if (order.UserId != userId && !_currentUser.IsInRole("Admin"))
            return Result.FailureResult("You can only cancel your own orders.");

        if (order.Status == OrderStatus.Cancelled || order.Status == OrderStatus.Refunded)
            return Result.FailureResult("Order is already cancelled or refunded.");

        if (order.Status == OrderStatus.Shipped || order.Status == OrderStatus.Delivered)
            return Result.FailureResult("Cannot cancel an order that has already been shipped or delivered.");

        order.Status = OrderStatus.Cancelled;

        var items = await _context.OrderItems.GetByExpressionAsync(i => i.OrderId == order.Id, cancellationToken);

        foreach (var item in items)
        {
            var product = await _context.Products.GetByIdAsync(item.ProductId, cancellationToken);
            if (product != null)
            {
                product.Stock += item.Quantity;
            }

            if (item.VariantId.HasValue)
            {
                var variant = await _context.ProductVariants.GetByIdAsync(item.VariantId.Value, cancellationToken);
                if (variant != null)
                {
                    variant.Stock += item.Quantity;
                }
            }
        }

        if (order.PaymentStatus == PaymentStatus.Paid && !string.IsNullOrEmpty(order.PaymentTransactionId))
        {
            order.PaymentStatus = PaymentStatus.Refunded;

            _ = Task.Run(async () =>
            {
                try
                {
                    await _paymentGateway.RefundPaymentAsync(order.PaymentTransactionId, order.Total, cancellationToken);
                }
                catch { }
            });
        }
        else
        {
            order.PaymentStatus = PaymentStatus.Refunded;
        }

        await _context.UnitOfWork.SaveChangesAsync(cancellationToken);

        return Result.SuccessResult("Order cancelled successfully.");
    }
}
