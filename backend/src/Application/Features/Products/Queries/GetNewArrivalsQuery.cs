using Application.Interfaces;
using MediatR;

namespace Application.Features.Products.Queries;

public record GetNewArrivalsQuery : IRequest<List<ProductDto>>;

public class GetNewArrivalsQueryHandler : IRequestHandler<GetNewArrivalsQuery, List<ProductDto>>
{
    private readonly IApplicationDbContext _context;

    public GetNewArrivalsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductDto>> Handle(GetNewArrivalsQuery request, CancellationToken cancellationToken)
    {
        var products = (await _context.Products
            .GetByExpressionAsync(p => p.IsActive, cancellationToken))
            .OrderByDescending(p => p.CreatedAt)
            .Take(8)
            .ToList();

        return products.Select(GetProductsQueryHandler.MapToDto).ToList();
    }
}
