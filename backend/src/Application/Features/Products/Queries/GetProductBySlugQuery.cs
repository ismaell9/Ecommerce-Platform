using Application.Features.Products.Queries;
using Application.Interfaces;
using Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Application.Features.Products.Queries;

public record GetProductBySlugQuery(string Slug) : IRequest<ProductDetailDto>;

public class ProductDetailDto : ProductDto
{
    public List<ProductSpecificationDto> Specifications { get; set; } = new();
    public List<ProductReviewDto> Reviews { get; set; } = new();
}

public class ProductSpecificationDto
{
    public string Name { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}

public class ProductReviewDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsVerifiedPurchase { get; set; }
}

public class GetProductBySlugQueryHandler : IRequestHandler<GetProductBySlugQuery, ProductDetailDto>
{
    private readonly IApplicationDbContext _context;

    public GetProductBySlugQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ProductDetailDto> Handle(GetProductBySlugQuery request, CancellationToken cancellationToken)
    {
        var product = await _context.ProductsWithIncludes
            .Include(p => p.Images)
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Variants)
            .FirstOrDefaultAsync(p => p.Slug == request.Slug && p.IsActive, cancellationToken)
            ?? throw new NotFoundException("Product", request.Slug);

        var reviews = await _context.ProductReviews
            .GetByExpressionAsync(r => r.ProductId == product.Id, cancellationToken);

        var specs = await _context.ProductSpecifications
            .GetByExpressionAsync(s => s.ProductId == product.Id, cancellationToken);

        return new ProductDetailDto
        {
            Id = product.Id,
            Name = product.Name,
            Slug = product.Slug,
            Description = product.Description,
            ShortDescription = product.ShortDescription,
            Price = product.Price,
            OriginalPrice = product.OriginalPrice,
            Stock = product.Stock,
            Sku = product.Sku,
            AverageRating = product.AverageRating,
            ReviewCount = product.ReviewCount,
            IsActive = product.IsActive,
            CreatedAt = product.CreatedAt,
            Category = product.Category != null ? new CategoryDto
            {
                Id = product.Category.Id,
                Name = product.Category.Name,
                Slug = product.Category.Slug,
                Description = product.Category.Description,
                ImageUrl = product.Category.ImageUrl
            } : null,
            Brand = product.Brand != null ? new BrandDto
            {
                Id = product.Brand.Id,
                Name = product.Brand.Name,
                Slug = product.Brand.Slug,
                Description = product.Brand.Description,
                ImageUrl = product.Brand.ImageUrl
            } : null,
            Images = product.Images.OrderBy(i => i.Order).Select(i => new ProductImageDto
            {
                Id = i.Id,
                Url = i.Url,
                AltText = i.AltText,
                IsPrimary = i.IsPrimary,
                Order = i.Order
            }).ToList(),
            Variants = product.Variants.Select(v => new ProductVariantDto
            {
                Id = v.Id,
                Sku = v.Sku,
                Price = v.Price,
                OriginalPrice = v.OriginalPrice,
                Stock = v.Stock,
                Attributes = JsonSerializer.Deserialize<Dictionary<string, string>>(v.Attributes) ?? new()
            }).ToList(),
            Specifications = specs.Select(s => new ProductSpecificationDto
            {
                Name = s.Name,
                Value = s.Value
            }).ToList(),
            Reviews = reviews.OrderByDescending(r => r.CreatedAt).Select(r => new ProductReviewDto
            {
                Id = r.Id,
                UserId = r.UserId,
                UserName = r.User?.FirstName + " " + r.User?.LastName,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                IsVerifiedPurchase = r.IsVerifiedPurchase
            }).ToList()
        };
    }
}
