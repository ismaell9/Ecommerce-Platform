using Application.Common;
using Application.Interfaces;
using Domain.Entities;
using Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Products.Commands;

public record AddReviewCommand(Guid ProductId, int Rating, string Comment) : IRequest<Result<ProductReviewDto>>;

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

public class AddReviewCommandHandler : IRequestHandler<AddReviewCommand, Result<ProductReviewDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public AddReviewCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<ProductReviewDto>> Handle(AddReviewCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException();

        var user = await _context.Users.GetByIdAsync(userId, cancellationToken)
            ?? throw new NotFoundException("User", userId);

        var product = await _context.ProductsWithIncludes
            .Include(p => p.Reviews)
            .FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken)
            ?? throw new NotFoundException("Product", request.ProductId);

        var existingReview = (await _context.ProductReviews
            .GetByExpressionAsync(r => r.ProductId == request.ProductId && r.UserId == userId, cancellationToken))
            .FirstOrDefault();

        if (existingReview != null)
            return Result<ProductReviewDto>.FailureResult("You have already reviewed this product.");

        var hasPurchased = (await _context.Orders
            .GetByExpressionAsync(o => o.UserId == userId && o.Items.Any(i => i.ProductId == request.ProductId), cancellationToken))
            .Any();

        var review = new ProductReview
        {
            Id = Guid.NewGuid(),
            ProductId = request.ProductId,
            UserId = userId,
            Rating = request.Rating,
            Comment = request.Comment,
            IsVerifiedPurchase = hasPurchased
        };

        await _context.ProductReviews.AddAsync(review, cancellationToken);

        var reviews = product.Reviews.Concat(new[] { review }).ToList();
        product.AverageRating = Math.Round((decimal)reviews.Average(r => r.Rating), 1);
        product.ReviewCount = reviews.Count;

        await _context.UnitOfWork.SaveChangesAsync(cancellationToken);

        return Result<ProductReviewDto>.SuccessResult(new ProductReviewDto
        {
            Id = review.Id,
            UserId = review.UserId,
            UserName = $"{user.FirstName} {user.LastName}",
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt,
            IsVerifiedPurchase = review.IsVerifiedPurchase
        });
    }
}
