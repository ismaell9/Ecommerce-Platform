using Domain.Common;

namespace Domain.Entities;

public class CouponUsage : BaseEntity
{
    public Guid CouponId { get; set; }
    public Coupon Coupon { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
}
