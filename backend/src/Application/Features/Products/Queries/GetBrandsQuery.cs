using Application.Interfaces;
using MediatR;

namespace Application.Features.Products.Queries;

public record GetBrandsQuery : IRequest<List<BrandDto>>;

public class GetBrandsQueryHandler : IRequestHandler<GetBrandsQuery, List<BrandDto>>
{
    private readonly IApplicationDbContext _context;

    public GetBrandsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<BrandDto>> Handle(GetBrandsQuery request, CancellationToken cancellationToken)
    {
        var brands = await _context.Brands.GetAllAsync(cancellationToken);
        return brands.Select(b => new BrandDto
        {
            Id = b.Id,
            Name = b.Name,
            Slug = b.Slug,
            Description = b.Description,
            ImageUrl = b.ImageUrl
        }).ToList();
    }
}
