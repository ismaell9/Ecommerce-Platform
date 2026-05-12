using Application.Interfaces;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

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
        var products = await _context.ProductsWithIncludes
            .Include(p => p.Images)
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Where(p => p.IsActive)
            .OrderByDescending(p => p.CreatedAt)
            .Take(8)
            .ToListAsync(cancellationToken);

        return products.Select(GetProductsQueryHandler.MapToDto).ToList();
    }
}
