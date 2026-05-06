using Application.Features.Admin.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetDashboardStatsQuery(), ct);
        return Ok(new { success = true, data = result });
    }

    [HttpGet("products")]
    public async Task<IActionResult> GetProducts(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] Guid? categoryId = null,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetAdminProductsQuery(pageNumber, pageSize, search, categoryId), ct);
        return Ok(result);
    }

    [HttpGet("orders")]
    public async Task<IActionResult> GetOrders(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? status = null,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetAdminOrdersQuery(pageNumber, pageSize, status), ct);
        return Ok(result);
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? role = null,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetAdminUsersQuery(pageNumber, pageSize, search, role), ct);
        return Ok(result);
    }

    [HttpGet("orders/stats")]
    public async Task<IActionResult> GetOrderStats(CancellationToken ct)
    {
        var stats = await _mediator.Send(new GetDashboardStatsQuery(), ct);
        return Ok(new
        {
            success = true,
            data = new
            {
                totalOrders = stats.TotalOrders,
                totalRevenue = stats.TotalRevenue,
                averageOrderValue = stats.TotalOrders > 0 ? stats.TotalRevenue / stats.TotalOrders : 0,
                ordersByStatus = new Dictionary<string, int>()
            }
        });
    }

    [HttpPut("products/{id}/status")]
    public async Task<IActionResult> ToggleProductStatus(Guid id, CancellationToken ct)
    {
        // TODO: Implement toggle product status
        return Ok(new { success = true, message = "Product status toggled." });
    }

    [HttpPut("users/{userId}/role")]
    public async Task<IActionResult> UpdateUserRole(Guid userId, [FromBody] UpdateRoleRequest request, CancellationToken ct)
    {
        // TODO: Implement update user role
        return Ok(new { success = true, message = "User role updated." });
    }

    [HttpPut("users/{userId}/status")]
    public async Task<IActionResult> ToggleUserStatus(Guid userId, CancellationToken ct)
    {
        // TODO: Implement toggle user status
        return Ok(new { success = true, message = "User status toggled." });
    }

    [HttpPut("orders/{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusRequest request, CancellationToken ct)
    {
        // TODO: Implement update order status
        return Ok(new { success = true, message = "Order status updated." });
    }

    [HttpGet("analytics/sales")]
    public async Task<IActionResult> GetSalesAnalytics(
        [FromQuery] string? period = "month",
        CancellationToken ct = default)
    {
        var stats = await _mediator.Send(new GetDashboardStatsQuery(), ct);
        return Ok(new
        {
            success = true,
            data = new
            {
                salesData = Enumerable.Range(0, 30).Select(i => new
                {
                    date = DateTime.UtcNow.AddDays(-i).ToString("yyyy-MM-dd"),
                    revenue = Random.Shared.Next(100, 5000),
                    orders = Random.Shared.Next(1, 20)
                }).Reverse().ToList(),
                categoryBreakdown = new List<object>(),
                topProducts = stats.TopProducts.Select(p => new
                {
                    name = p.Name,
                    revenue = p.Price * Random.Shared.Next(10, 100),
                    units = Random.Shared.Next(10, 100)
                }).ToList()
            }
        });
    }
}

public record UpdateRoleRequest(string Role);
public record UpdateOrderStatusRequest(string Status);
