using Application.Common;
using Application.Features.Products.Queries;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Admin.Queries;

public record GetAdminProductsQuery(
    int PageNumber = 1,
    int PageSize = 10,
    string? Search = null,
    Guid? CategoryId = null) : IRequest<PaginatedResult<ProductDto>>;

public class GetAdminProductsQueryHandler : IRequestHandler<GetAdminProductsQuery, PaginatedResult<ProductDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAdminProductsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<ProductDto>> Handle(GetAdminProductsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.ProductsWithIncludes
            .Include(p => p.Images)
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Variants)
            .Where(p =>
                (string.IsNullOrEmpty(request.Search) ||
                    p.Name.Contains(request.Search) ||
                    p.Sku.Contains(request.Search) ||
                    p.Category.Name.Contains(request.Search) ||
                    (p.Brand != null && p.Brand.Name.Contains(request.Search))) &&
                (!request.CategoryId.HasValue || p.CategoryId == request.CategoryId));

        var totalCount = await query.CountAsync(cancellationToken);

        var products = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = products.Select(GetProductsQueryHandler.MapToDto).ToList();

        return PaginatedResult<ProductDto>.Create(dtos, totalCount, request.PageNumber, request.PageSize);
    }
}
