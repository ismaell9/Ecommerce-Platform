using Application.Interfaces;
using MediatR;

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
        var products = (await _context.Products
            .GetByExpressionAsync(p => p.IsActive, cancellationToken))
            .OrderByDescending(p => p.AverageRating * p.ReviewCount)
            .Take(8)
            .ToList();

        return products.Select(GetProductsQueryHandler.MapToDto).ToList();
    }
}
