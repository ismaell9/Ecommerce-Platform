using Application.Common;
using Application.Features.Products.Queries;
using Application.Interfaces;
using MediatR;

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
        var products = await _context.Products.GetPagedAsync(
            request.PageNumber,
            request.PageSize,
            predicate: p =>
                (string.IsNullOrEmpty(request.Search) || p.Name.Contains(request.Search)) &&
                (!request.CategoryId.HasValue || p.CategoryId == request.CategoryId),
            orderBy: q => q.OrderByDescending(p => p.CreatedAt),
            cancellationToken: cancellationToken);

        var dtos = products.Items.Select(GetProductsQueryHandler.MapToDto).ToList();

        return PaginatedResult<ProductDto>.Create(dtos, products.TotalCount, products.CurrentPage, products.PageSize);
    }
}
