using Application.Common;
using Application.Interfaces;
using Domain.Entities;
using MediatR;

namespace Application.Features.Products.Queries;

public record GetProductsQuery(
    int PageNumber = 1,
    int PageSize = 12,
    Guid? CategoryId = null,
    Guid? BrandId = null,
    decimal? MinPrice = null,
    decimal? MaxPrice = null,
    int? Rating = null,
    string? Search = null,
    bool? InStock = null,
    string? SortBy = null,
    string? SortOrder = "desc") : IRequest<PaginatedResult<ProductDto>>;

public class ProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public int Stock { get; set; }
    public string Sku { get; set; } = string.Empty;
    public decimal AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public CategoryDto? Category { get; set; }
    public BrandDto? Brand { get; set; }
    public List<ProductImageDto> Images { get; set; } = new();
    public List<ProductVariantDto> Variants { get; set; } = new();
}

public class CategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public Guid? ParentId { get; set; }
}

public class BrandDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
}

public class ProductImageDto
{
    public Guid Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string? AltText { get; set; }
    public bool IsPrimary { get; set; }
    public int Order { get; set; }
}

public class ProductVariantDto
{
    public Guid Id { get; set; }
    public string Sku { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public int Stock { get; set; }
    public Dictionary<string, string> Attributes { get; set; } = new();
}

public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, PaginatedResult<ProductDto>>
{
    private readonly IApplicationDbContext _context;

    public GetProductsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<ProductDto>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        var products = await _context.Products.GetPagedAsync(
            request.PageNumber,
            request.PageSize,
            predicate: p => p.IsActive &&
                (!request.CategoryId.HasValue || p.CategoryId == request.CategoryId) &&
                (!request.BrandId.HasValue || (p.BrandId.HasValue && p.BrandId == request.BrandId)) &&
                (!request.MinPrice.HasValue || p.Price >= request.MinPrice) &&
                (!request.MaxPrice.HasValue || p.Price <= request.MaxPrice) &&
                (!request.Rating.HasValue || p.AverageRating >= request.Rating) &&
                (!request.InStock.HasValue || p.Stock > 0) &&
                (string.IsNullOrEmpty(request.Search) || p.Name.Contains(request.Search) || p.Description.Contains(request.Search)),
            orderBy: request.SortBy switch
            {
                "price" => q => request.SortOrder == "asc"
                    ? q.OrderBy(p => p.Price)
                    : q.OrderByDescending(p => p.Price),
                "name" => q => request.SortOrder == "asc"
                    ? q.OrderBy(p => p.Name)
                    : q.OrderByDescending(p => p.Name),
                "rating" => q => request.SortOrder == "asc"
                    ? q.OrderBy(p => p.AverageRating)
                    : q.OrderByDescending(p => p.AverageRating),
                _ => q => request.SortOrder == "asc"
                    ? q.OrderBy(p => p.CreatedAt)
                    : q.OrderByDescending(p => p.CreatedAt)
            },
            cancellationToken: cancellationToken);

        var dtos = products.Items.Select(MapToDto).ToList();

        return PaginatedResult<ProductDto>.Create(
            dtos, products.TotalCount, products.CurrentPage, products.PageSize);
    }

    public static ProductDto MapToDto(Product p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Slug = p.Slug,
        Description = p.Description,
        ShortDescription = p.ShortDescription,
        Price = p.Price,
        OriginalPrice = p.OriginalPrice,
        Stock = p.Stock,
        Sku = p.Sku,
        AverageRating = p.AverageRating,
        ReviewCount = p.ReviewCount,
        IsActive = p.IsActive,
        CreatedAt = p.CreatedAt,
        Category = p.Category != null ? new CategoryDto
        {
            Id = p.Category.Id,
            Name = p.Category.Name,
            Slug = p.Category.Slug,
            Description = p.Category.Description,
            ImageUrl = p.Category.ImageUrl,
            ParentId = p.Category.ParentId
        } : null,
        Brand = p.Brand != null ? new BrandDto
        {
            Id = p.Brand.Id,
            Name = p.Brand.Name,
            Slug = p.Brand.Slug,
            Description = p.Brand.Description,
            ImageUrl = p.Brand.ImageUrl
        } : null,
        Images = p.Images.OrderBy(i => i.Order).Select(i => new ProductImageDto
        {
            Id = i.Id,
            Url = i.Url,
            AltText = i.AltText,
            IsPrimary = i.IsPrimary,
            Order = i.Order
        }).ToList(),
        Variants = p.Variants.Select(v => new ProductVariantDto
        {
            Id = v.Id,
            Sku = v.Sku,
            Price = v.Price,
            OriginalPrice = v.OriginalPrice,
            Stock = v.Stock,
            Attributes = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(v.Attributes) ?? new()
        }).ToList()
    };
}
