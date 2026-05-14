using Application.Interfaces;
using MediatR;

namespace Application.Features.Cart.Queries;

public record GetCouponByCodeQuery(string Code) : IRequest<CouponDto?>;

public class CouponDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DiscountType { get; set; } = string.Empty;
    public decimal DiscountValue { get; set; }
    public decimal? MinOrderAmount { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public bool IsActive { get; set; }
}

public class GetCouponByCodeQueryHandler : IRequestHandler<GetCouponByCodeQuery, CouponDto?>
{
    private readonly IApplicationDbContext _context;

    public GetCouponByCodeQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CouponDto?> Handle(GetCouponByCodeQuery request, CancellationToken cancellationToken)
    {
        var coupon = (await _context.Coupons
            .GetByExpressionAsync(c =>
                c.Code == request.Code &&
                c.IsActive &&
                c.ValidFrom <= DateTime.UtcNow &&
                c.ValidTo >= DateTime.UtcNow,
                cancellationToken))
            .FirstOrDefault();

        if (coupon == null) return null;

        return new CouponDto
        {
            Id = coupon.Id,
            Code = coupon.Code,
            Description = coupon.Description,
            DiscountType = coupon.DiscountType.ToString(),
            DiscountValue = coupon.DiscountValue,
            MinOrderAmount = coupon.MinOrderAmount,
            MaxDiscountAmount = coupon.MaxDiscountAmount,
            IsActive = coupon.IsActive
        };
    }
}
