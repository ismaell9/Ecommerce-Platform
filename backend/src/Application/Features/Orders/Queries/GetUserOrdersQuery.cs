using Application.Common;
using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using MediatR;
using System.Text.Json;

namespace Application.Features.Orders.Queries;

public record GetUserOrdersQuery(int PageNumber = 1, int PageSize = 10) : IRequest<PaginatedResult<OrderDto>>;

public class GetUserOrdersQueryHandler : IRequestHandler<GetUserOrdersQuery, PaginatedResult<OrderDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetUserOrdersQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<PaginatedResult<OrderDto>> Handle(GetUserOrdersQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException();

        var orders = await _context.Orders.GetPagedAsync(
            request.PageNumber,
            request.PageSize,
            predicate: o => o.UserId == userId,
            orderBy: q => q.OrderByDescending(o => o.CreatedAt),
            cancellationToken: cancellationToken);

        var dtos = new List<OrderDto>();

        foreach (var order in orders.Items)
        {
            var dto = MapToDto(order);
            var items = await _context.OrderItems.GetByExpressionAsync(oi => oi.OrderId == order.Id, cancellationToken);
            dto.Items = items.Select(i => new OrderItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.ProductName,
                ProductImage = i.ProductImage,
                VariantAttributes = i.VariantAttributes,
                Quantity = i.Quantity,
                Price = i.Price,
                Subtotal = i.Subtotal
            }).ToList();

            dtos.Add(dto);
        }

        return PaginatedResult<OrderDto>.Create(dtos, orders.TotalCount, orders.CurrentPage, orders.PageSize);
    }

    private static OrderDto MapToDto(Order order) => new()
    {
        Id = order.Id,
        OrderNumber = order.OrderNumber,
        Subtotal = order.Subtotal,
        Discount = order.Discount,
        Tax = order.Tax,
        Shipping = order.Shipping,
        Total = order.Total,
        Status = order.Status.ToString(),
        PaymentStatus = order.PaymentStatus.ToString(),
        PaymentMethod = order.PaymentMethod,
        ShippingAddress = order.ShippingAddress,
        TrackingNumber = order.TrackingNumber,
        Notes = order.Notes,
        CreatedAt = order.CreatedAt
    };
}
