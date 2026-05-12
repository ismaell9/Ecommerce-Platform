using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public class Order : BaseEntity
{
    public string OrderNumber { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public decimal Subtotal { get; set; }
    public decimal Discount { get; set; }
    public decimal Tax { get; set; }
    public decimal Shipping { get; set; }
    public decimal Total { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
    public string? PaymentMethod { get; set; }
    public string? PaymentTransactionId { get; set; }

    public string ShippingAddress { get; set; } = string.Empty;
    public string? TrackingNumber { get; set; }
    public string? Notes { get; set; }

    public Guid? CouponId { get; set; }
    public Coupon? Coupon { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}
