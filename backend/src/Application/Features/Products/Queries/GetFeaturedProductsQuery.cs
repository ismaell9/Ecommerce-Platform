using Application.Interfaces;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Products.Queries;

public record GetFeaturedProductsQuery : IRequest<List<ProductDto>>;

public class GetFeaturedProductsQueryHandler : IRequestHandler<GetFeaturedProductsQuery, List<ProductDto>>
{
    private readonly IApplicationDbContext _context;

    public GetFeaturedProductsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductDto>> Handle(GetFeaturedProductsQuery request, CancellationToken cancellationToken)
    {
        var products = await _context.ProductsWithIncludes
            .Include(p => p.Images)
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Where(p => p.IsActive)
            .OrderByDescending(p => p.AverageRating * p.ReviewCount)
            .Take(8)
            .ToListAsync(cancellationToken);

        return products.Select(GetProductsQueryHandler.MapToDto).ToList();
    }
}
