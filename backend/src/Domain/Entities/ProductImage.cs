using Domain.Common;

namespace Domain.Entities;

public class ProductImage : BaseEntity
{
    public string Url { get; set; } = string.Empty;
    public string? AltText { get; set; }
    public bool IsPrimary { get; set; }
    public int Order { get; set; }

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
}
