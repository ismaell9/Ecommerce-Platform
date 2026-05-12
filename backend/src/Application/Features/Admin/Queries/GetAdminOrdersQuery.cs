using Application.Common;
using Application.DTOs;
using Application.Features.Orders.Queries;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using MediatR;

namespace Application.Features.Admin.Queries;

public record GetAdminOrdersQuery(
    int PageNumber = 1,
    int PageSize = 10,
    string? Status = null) : IRequest<PaginatedResult<OrderDto>>;

public class GetAdminOrdersQueryHandler : IRequestHandler<GetAdminOrdersQuery, PaginatedResult<OrderDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAdminOrdersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<OrderDto>> Handle(GetAdminOrdersQuery request, CancellationToken cancellationToken)
    {
        var orders = await _context.Orders.GetPagedAsync(
            request.PageNumber,
            request.PageSize,
            predicate: string.IsNullOrEmpty(request.Status)
                ? null
                : o => o.Status.ToString() == request.Status,
            orderBy: q => q.OrderByDescending(o => o.CreatedAt),
            cancellationToken: cancellationToken);

        var dtos = orders.Data.Select(o => new OrderDto
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            Subtotal = o.Subtotal,
            Discount = o.Discount,
            Tax = o.Tax,
            Shipping = o.Shipping,
            Total = o.Total,
            Status = o.Status.ToString(),
            PaymentStatus = o.PaymentStatus.ToString(),
            PaymentMethod = o.PaymentMethod,
            PaymentTransactionId = o.PaymentTransactionId,
            ShippingAddress = o.ShippingAddress,
            TrackingNumber = o.TrackingNumber,
            Notes = o.Notes,
            CreatedAt = o.CreatedAt
        }).ToList();

        return PaginatedResult<OrderDto>.Create(dtos, orders.TotalCount, orders.CurrentPage, orders.PageSize);
    }
}
