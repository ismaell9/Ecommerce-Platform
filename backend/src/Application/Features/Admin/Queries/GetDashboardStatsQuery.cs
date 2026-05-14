using Application.Common;
using Application.Interfaces;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Admin.Queries;

public record GetDashboardStatsQuery : IRequest<DashboardStatsDto>;

public class DashboardStatsDto
{
    public decimal TotalRevenue { get; set; }
    public int TotalOrders { get; set; }
    public int TotalProducts { get; set; }
    public int TotalUsers { get; set; }
    public decimal RevenueChange { get; set; }
    public decimal OrdersChange { get; set; }
    public List<RecentOrderDto> RecentOrders { get; set; } = new();
    public List<TopProductDto> TopProducts { get; set; } = new();
}

public class RecentOrderDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int ItemCount { get; set; }
}

public class TopProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
}

public class GetDashboardStatsQueryHandler : IRequestHandler<GetDashboardStatsQuery, DashboardStatsDto>
{
    private readonly IApplicationDbContext _context;

    public GetDashboardStatsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardStatsDto> Handle(GetDashboardStatsQuery request, CancellationToken cancellationToken)
    {
        var orders = await _context.Orders.GetAllAsync(cancellationToken);
        var products = await _context.ProductsWithIncludes
            .Include(p => p.Images)
            .ToListAsync(cancellationToken);
        var users = await _context.Users.GetAllAsync(cancellationToken);

        var thisMonth = orders.Where(o => o.CreatedAt.Month == DateTime.UtcNow.Month && o.CreatedAt.Year == DateTime.UtcNow.Year).ToList();
        var lastMonth = orders.Where(o => o.CreatedAt.Month == DateTime.UtcNow.AddMonths(-1).Month && o.CreatedAt.Year == DateTime.UtcNow.AddMonths(-1).Year).ToList();

        var totalRevenue = thisMonth.Where(o => o.PaymentStatus == PaymentStatus.Paid).Sum(o => o.Total);
        var lastMonthRevenue = lastMonth.Where(o => o.PaymentStatus == PaymentStatus.Paid).Sum(o => o.Total);
        var revenueChange = lastMonthRevenue > 0
            ? Math.Round((totalRevenue - lastMonthRevenue) / lastMonthRevenue * 100, 1)
            : 100;

        var ordersChange = lastMonth.Count > 0
            ? Math.Round((thisMonth.Count - lastMonth.Count) / (decimal)lastMonth.Count * 100, 1)
            : 100;

        var recentOrderIds = orders.OrderByDescending(o => o.CreatedAt).Take(5).Select(o => o.Id).ToList();
        var itemCounts = (await _context.OrderItems
            .GetByExpressionAsync(oi => recentOrderIds.Contains(oi.OrderId), cancellationToken))
            .GroupBy(oi => oi.OrderId)
            .ToDictionary(g => g.Key, g => g.Count());

        var recentOrders = orders
            .OrderByDescending(o => o.CreatedAt)
            .Take(5)
            .Select(o => new RecentOrderDto
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                Total = o.Total,
                Status = o.Status.ToString(),
                CreatedAt = o.CreatedAt,
                ItemCount = itemCounts.GetValueOrDefault(o.Id, 0)
            })
            .ToList();

        var topProducts = products
            .OrderByDescending(p => p.ReviewCount * p.AverageRating)
            .Take(5)
            .Select(p => new TopProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                ImageUrl = p.Images.FirstOrDefault(i => i.IsPrimary)?.Url ?? p.Images.FirstOrDefault()?.Url ?? ""
            })
            .ToList();

        return new DashboardStatsDto
        {
            TotalRevenue = totalRevenue,
            TotalOrders = thisMonth.Count,
            TotalProducts = products.Count(p => p.IsActive),
            TotalUsers = users.Count(u => u.IsActive),
            RevenueChange = revenueChange,
            OrdersChange = ordersChange,
            RecentOrders = recentOrders,
            TopProducts = topProducts
        };
    }
}
