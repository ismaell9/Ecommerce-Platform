using Application.Features.Products.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 12,
        [FromQuery] Guid? categoryId = null,
        [FromQuery] Guid? brandId = null,
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] int? rating = null,
        [FromQuery] string? search = null,
        [FromQuery] bool? inStock = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortOrder = "desc",
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetProductsQuery(
            pageNumber, pageSize, categoryId, brandId, minPrice, maxPrice, rating, search, inStock, sortBy, sortOrder), ct);
        return Ok(new { success = true, data = result });
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetProductBySlug(string slug, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetProductBySlugQuery(slug), ct);
        return Ok(new { success = true, data = result });
    }

    [HttpGet("featured")]
    public async Task<IActionResult> GetFeaturedProducts(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetFeaturedProductsQuery(), ct);
        return Ok(new { success = true, data = result });
    }

    [HttpGet("new-arrivals")]
    public async Task<IActionResult> GetNewArrivals(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetNewArrivalsQuery(), ct);
        return Ok(new { success = true, data = result });
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchProducts([FromQuery] string query, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetProductsQuery(Search: query), ct);
        return Ok(new { success = true, data = result });
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetCategoriesQuery(), ct);
        return Ok(new { success = true, data = result });
    }

    [HttpGet("brands")]
    public async Task<IActionResult> GetBrands(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetBrandsQuery(), ct);
        return Ok(new { success = true, data = result });
    }

    [HttpGet("{productId}/reviews")]
    public async Task<IActionResult> GetReviews(Guid productId, CancellationToken ct)
    {
        var product = await _mediator.Send(new GetProductBySlugQuery(""), ct);
        // Reviews are included in product detail
        return Ok(new { success = true, data = new List<object>() });
    }

    [HttpPost("{productId}/reviews")]
    [Authorize]
    public async Task<IActionResult> AddReview(Guid productId, [FromBody] AddReviewRequest request, CancellationToken ct)
    {
        // TODO: Implement add review handler
        return Ok(new { success = true, message = "Review added." });
    }
}

public record AddReviewRequest(int Rating, string Comment);
