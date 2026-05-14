using Application.Interfaces;
using Domain.Exceptions;
using MediatR;

namespace Application.Features.Products.Queries;

public record GetProductReviewsQuery(Guid ProductId) : IRequest<List<ProductReviewDto>>;

public class GetProductReviewsQueryHandler : IRequestHandler<GetProductReviewsQuery, List<ProductReviewDto>>
{
    private readonly IApplicationDbContext _context;

    public GetProductReviewsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductReviewDto>> Handle(GetProductReviewsQuery request, CancellationToken cancellationToken)
    {
        var product = await _context.Products.GetByIdAsync(request.ProductId, cancellationToken);
        if (product == null)
            throw new NotFoundException("Product", request.ProductId);

        var reviews = await _context.ProductReviews
            .GetByExpressionAsync(r => r.ProductId == request.ProductId, cancellationToken);

        var userIds = reviews.Select(r => r.UserId).Distinct().ToList();
        var users = new List<Domain.Entities.User>();
        foreach (var uid in userIds)
        {
            var u = await _context.Users.GetByIdAsync(uid, cancellationToken);
            if (u != null) users.Add(u);
        }
        var userMap = users.ToDictionary(u => u.Id);

        return reviews.OrderByDescending(r => r.CreatedAt).Select(r =>
        {
            userMap.TryGetValue(r.UserId, out var user);
            return new ProductReviewDto
            {
                Id = r.Id,
                UserId = r.UserId,
                UserName = user != null ? $"{user.FirstName} {user.LastName}" : "Unknown",
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                IsVerifiedPurchase = r.IsVerifiedPurchase
            };
        }).ToList();
    }
}
