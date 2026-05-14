using Application.Features.Admin.Queries;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IApplicationDbContext _context;

    public AdminController(IMediator mediator, IApplicationDbContext context)
    {
        _mediator = mediator;
        _context = context;
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
        [FromQuery] string? search = null,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetAdminOrdersQuery(pageNumber, pageSize, status, search), ct);
        return Ok(result);
    }

    [HttpPost("products")]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductRequest request, CancellationToken ct)
    {
        var categoryId = request.CategoryId;
        if (!categoryId.HasValue)
        {
            var defaultCategory = (await _context.Categories.GetAllAsync(ct)).FirstOrDefault();
            if (defaultCategory == null)
            {
                return BadRequest(new { success = false, message = "A category is required to create a product." });
            }

            categoryId = defaultCategory.Id;
        }

        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Slug = request.Name.ToLowerInvariant().Replace(' ', '-'),
            Description = request.Description ?? string.Empty,
            Price = request.Price,
            OriginalPrice = request.OriginalPrice,
            Stock = request.Stock,
            Sku = request.Sku,
            IsActive = request.IsActive,
            CategoryId = categoryId.Value,
            BrandId = request.BrandId,
        };

        await _context.Products.AddAsync(product, ct);
        await _context.UnitOfWork.SaveChangesAsync(ct);

        return Ok(new { success = true, data = product });
    }

    [HttpPut("products/{id}")]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] UpdateProductRequest request, CancellationToken ct)
    {
        var product = await _context.Products.GetByIdAsync(id, ct);
        if (product == null)
        {
            return NotFound(new { success = false, message = "Product not found." });
        }

        product.Name = request.Name;
        product.Slug = request.Name.ToLowerInvariant().Replace(' ', '-');
        product.Description = request.Description ?? string.Empty;
        product.Price = request.Price;
        product.OriginalPrice = request.OriginalPrice;
        product.Stock = request.Stock;
        product.Sku = request.Sku;
        product.IsActive = request.IsActive;
        product.CategoryId = request.CategoryId ?? product.CategoryId;
        product.BrandId = request.BrandId;

        await _context.Products.UpdateAsync(product, ct);
        await _context.UnitOfWork.SaveChangesAsync(ct);

        return Ok(new { success = true, data = product });
    }

    [HttpPut("products/{id}/status")]
    public async Task<IActionResult> ToggleProductStatus(Guid id, CancellationToken ct)
    {
        var product = await _context.Products.GetByIdAsync(id, ct);
        if (product == null)
        {
            return NotFound(new { success = false, message = "Product not found." });
        }

        product.IsActive = !product.IsActive;
        await _context.Products.UpdateAsync(product, ct);
        await _context.UnitOfWork.SaveChangesAsync(ct);

        return Ok(new { success = true, data = product });
    }

    [HttpPut("users/{userId}/role")]
    public async Task<IActionResult> UpdateUserRole(Guid userId, [FromBody] UpdateRoleRequest request, CancellationToken ct)
    {
        var user = await _context.Users.GetByIdAsync(userId, ct);
        if (user == null)
        {
            return NotFound(new { success = false, message = "User not found." });
        }

        var role = (await _context.Roles.GetByExpressionAsync(r => r.Name == request.Role, ct)).FirstOrDefault();
        if (role == null)
        {
            return NotFound(new { success = false, message = "Role not found." });
        }

        if (_context is ApplicationDbContext dbContext)
        {
            var memberships = await dbContext.UserRoles.Where(ur => ur.UserId == userId).ToListAsync(ct);
            dbContext.UserRoles.RemoveRange(memberships);
            dbContext.UserRoles.Add(new UserRole { UserId = userId, RoleId = role.Id });
            await dbContext.SaveChangesAsync(ct);
        }
        else
        {
            user.UserRoles.Clear();
            user.UserRoles.Add(new UserRole { UserId = userId, RoleId = role.Id });
            await _context.Users.UpdateAsync(user, ct);
            await _context.UnitOfWork.SaveChangesAsync(ct);
        }

        return Ok(new { success = true, message = "User role updated." });
    }

    [HttpPut("users/{userId}/status")]
    public async Task<IActionResult> ToggleUserStatus(Guid userId, CancellationToken ct)
    {
        var user = await _context.Users.GetByIdAsync(userId, ct);
        if (user == null)
        {
            return NotFound(new { success = false, message = "User not found." });
        }

        user.IsActive = !user.IsActive;
        await _context.Users.UpdateAsync(user, ct);
        await _context.UnitOfWork.SaveChangesAsync(ct);

        return Ok(new { success = true, data = user });
    }

    [HttpPut("orders/{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusRequest request, CancellationToken ct)
    {
        var order = await _context.Orders.GetByIdAsync(id, ct);
        if (order == null)
        {
            return NotFound(new { success = false, message = "Order not found." });
        }

        order.Status = Enum.Parse<OrderStatus>(request.Status, true);
        await _context.Orders.UpdateAsync(order, ct);
        await _context.UnitOfWork.SaveChangesAsync(ct);

        return Ok(new { success = true, data = order });
    }

    [HttpGet("analytics/sales")]
    public async Task<IActionResult> GetSalesAnalytics(
        [FromQuery] string? period = "month",
        CancellationToken ct = default)
    {
        var stats = await _mediator.Send(new GetDashboardStatsQuery(), ct);

        var categories = await _context.Categories.GetAllAsync(ct);
        var products = await _context.ProductsWithIncludes
            .Include(p => p.Category)
            .ToListAsync(ct);

        var categoryBreakdown = categories
            .Select(c =>
            {
                var catProducts = products.Where(p => p.CategoryId == c.Id).ToList();
                return new
                {
                    category = c.Name,
                    revenue = catProducts.Sum(p => (double)p.Price * Random.Shared.Next(1, 20)),
                    count = catProducts.Count
                };
            })
            .Where(c => c.count > 0)
            .OrderByDescending(c => c.revenue)
            .ToList();

        var topProducts = stats.TopProducts.Select(p => new
        {
            name = p.Name,
            revenue = p.Price * Random.Shared.Next(10, 100),
            units = Random.Shared.Next(10, 100)
        }).ToList();

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
                categoryBreakdown,
                topProducts
            }
        });
    }
}

public record UpdateRoleRequest(string Role);
public record UpdateOrderStatusRequest(string Status);
public record CreateProductRequest(
    string Name,
    string Sku,
    decimal Price,
    int Stock,
    string? Description,
    bool IsActive,
    Guid? CategoryId,
    Guid? BrandId,
    decimal? OriginalPrice);
public record UpdateProductRequest(
    string Name,
    string Sku,
    decimal Price,
    int Stock,
    string? Description,
    bool IsActive,
    Guid? CategoryId,
    Guid? BrandId,
    decimal? OriginalPrice);
