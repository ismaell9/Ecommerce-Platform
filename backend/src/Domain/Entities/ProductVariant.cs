using Domain.Common;

namespace Domain.Entities;

public class ProductVariant : BaseEntity
{
    public string Sku { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public int Stock { get; set; }
    public string Attributes { get; set; } = "{}";

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
