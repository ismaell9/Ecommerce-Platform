using System.Text.Json;
using Application.Common;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using MediatR;

namespace Application.Features.Admin.Queries;

public record GetAdminOrdersQuery(
    int PageNumber = 1,
    int PageSize = 10,
    string? Status = null) : IRequest<PaginatedResult<AdminOrderDto>>;

public class AdminOrderDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
    public decimal Discount { get; set; }
    public decimal Tax { get; set; }
    public decimal Shipping { get; set; }
    public decimal Total { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public string? PaymentMethod { get; set; }
    public string? PaymentTransactionId { get; set; }
    public JsonElement? ShippingAddress { get; set; }
    public string? TrackingNumber { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ItemCount { get; set; }
}

public class GetAdminOrdersQueryHandler : IRequestHandler<GetAdminOrdersQuery, PaginatedResult<AdminOrderDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAdminOrdersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<AdminOrderDto>> Handle(GetAdminOrdersQuery request, CancellationToken cancellationToken)
    {
        var orders = await _context.Orders.GetPagedAsync(
            request.PageNumber,
            request.PageSize,
            predicate: string.IsNullOrEmpty(request.Status)
                ? null
                : o => o.Status.ToString() == request.Status,
            orderBy: q => q.OrderByDescending(o => o.CreatedAt),
            cancellationToken: cancellationToken);

        var orderIds = orders.Data.Select(o => o.Id).ToList();
        var itemCounts = (await _context.OrderItems
            .GetByExpressionAsync(oi => orderIds.Contains(oi.OrderId), cancellationToken))
            .GroupBy(oi => oi.OrderId)
            .ToDictionary(g => g.Key, g => g.Count());

        var dtos = orders.Data.Select(o => new AdminOrderDto
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
            ShippingAddress = TryParseJson(o.ShippingAddress),
            TrackingNumber = o.TrackingNumber,
            Notes = o.Notes,
            CreatedAt = o.CreatedAt,
            ItemCount = itemCounts.GetValueOrDefault(o.Id, 0)
        }).ToList();

        return PaginatedResult<AdminOrderDto>.Create(dtos, orders.TotalCount, orders.CurrentPage, orders.PageSize);
    }

    private static JsonElement? TryParseJson(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        try { return JsonSerializer.Deserialize<JsonElement>(value); }
        catch { return null; }
    }
}
