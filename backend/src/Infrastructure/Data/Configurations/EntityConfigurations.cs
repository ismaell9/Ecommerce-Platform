using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");
        builder.HasKey(u => u.Id);

        builder.Property(u => u.FirstName).IsRequired().HasMaxLength(100);
        builder.Property(u => u.LastName).IsRequired().HasMaxLength(100);
        builder.Property(u => u.Email).IsRequired().HasMaxLength(256);
        builder.HasIndex(u => u.Email).IsUnique();
        builder.Property(u => u.PasswordHash).IsRequired();
        builder.Property(u => u.PhoneNumber).HasMaxLength(20);
        builder.Property(u => u.EmailVerificationToken).HasMaxLength(500);
        builder.Property(u => u.PasswordResetToken).HasMaxLength(500);
        builder.Property(u => u.RefreshToken).HasMaxLength(500);

        builder.HasOne(u => u.Cart).WithOne(c => c.User).HasForeignKey<Cart>(c => c.UserId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(u => u.Wishlist).WithOne(w => w.User).HasForeignKey<Wishlist>(w => w.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable("Roles");
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Name).IsRequired().HasMaxLength(50);
        builder.HasIndex(r => r.Name).IsUnique();
        builder.Property(r => r.Description).HasMaxLength(200);
    }
}

public class UserRoleConfiguration : IEntityTypeConfiguration<UserRole>
{
    public void Configure(EntityTypeBuilder<UserRole> builder)
    {
        builder.ToTable("UserRoles");
        builder.HasKey(ur => new { ur.UserId, ur.RoleId });
        builder.HasOne(ur => ur.User).WithMany(u => u.UserRoles).HasForeignKey(ur => ur.UserId);
        builder.HasOne(ur => ur.Role).WithMany(r => r.UserRoles).HasForeignKey(ur => ur.RoleId);
    }
}

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("Categories");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Name).IsRequired().HasMaxLength(100);
        builder.Property(c => c.Slug).IsRequired().HasMaxLength(150);
        builder.HasIndex(c => c.Slug).IsUnique();
        builder.HasOne(c => c.Parent).WithMany(c => c.Children).HasForeignKey(c => c.ParentId).OnDelete(DeleteBehavior.Restrict);
    }
}

public class BrandConfiguration : IEntityTypeConfiguration<Brand>
{
    public void Configure(EntityTypeBuilder<Brand> builder)
    {
        builder.ToTable("Brands");
        builder.HasKey(b => b.Id);
        builder.Property(b => b.Name).IsRequired().HasMaxLength(100);
        builder.Property(b => b.Slug).IsRequired().HasMaxLength(150);
        builder.HasIndex(b => b.Slug).IsUnique();
    }
}

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Name).IsRequired().HasMaxLength(200);
        builder.Property(p => p.Slug).IsRequired().HasMaxLength(300);
        builder.HasIndex(p => p.Slug).IsUnique();
        builder.Property(p => p.Description).IsRequired();
        builder.Property(p => p.Sku).IsRequired().HasMaxLength(50);
        builder.HasIndex(p => p.Sku).IsUnique();
        builder.Property(p => p.Price).HasColumnType("decimal(18,2)");
        builder.Property(p => p.OriginalPrice).HasColumnType("decimal(18,2)");
        builder.Property(p => p.AverageRating).HasColumnType("decimal(3,2)");

        builder.HasOne(p => p.Category).WithMany(c => c.Products).HasForeignKey(p => p.CategoryId);
        builder.HasOne(p => p.Brand).WithMany(b => b.Products).HasForeignKey(p => p.BrandId).OnDelete(DeleteBehavior.SetNull);
    }
}

public class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> builder)
    {
        builder.ToTable("ProductImages");
        builder.HasKey(pi => pi.Id);
        builder.Property(pi => pi.Url).IsRequired().HasMaxLength(500);
        builder.Property(pi => pi.AltText).HasMaxLength(200);
        builder.HasOne(pi => pi.Product).WithMany(p => p.Images).HasForeignKey(pi => pi.ProductId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class ProductVariantConfiguration : IEntityTypeConfiguration<ProductVariant>
{
    public void Configure(EntityTypeBuilder<ProductVariant> builder)
    {
        builder.ToTable("ProductVariants");
        builder.HasKey(pv => pv.Id);
        builder.Property(pv => pv.Sku).IsRequired().HasMaxLength(50);
        builder.Property(pv => pv.Price).HasColumnType("decimal(18,2)");
        builder.Property(pv => pv.OriginalPrice).HasColumnType("decimal(18,2)");
        builder.Property(pv => pv.Attributes).IsRequired();
        builder.HasOne(pv => pv.Product).WithMany(p => p.Variants).HasForeignKey(pv => pv.ProductId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class ProductSpecificationConfiguration : IEntityTypeConfiguration<ProductSpecification>
{
    public void Configure(EntityTypeBuilder<ProductSpecification> builder)
    {
        builder.ToTable("ProductSpecifications");
        builder.HasKey(ps => ps.Id);
        builder.Property(ps => ps.Name).IsRequired().HasMaxLength(100);
        builder.Property(ps => ps.Value).IsRequired().HasMaxLength(500);
        builder.HasOne(ps => ps.Product).WithMany(p => p.Specifications).HasForeignKey(ps => ps.ProductId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class ProductReviewConfiguration : IEntityTypeConfiguration<ProductReview>
{
    public void Configure(EntityTypeBuilder<ProductReview> builder)
    {
        builder.ToTable("ProductReviews");
        builder.HasKey(pr => pr.Id);
        builder.Property(pr => pr.Comment).IsRequired().HasMaxLength(1000);
        builder.HasOne(pr => pr.Product).WithMany(p => p.Reviews).HasForeignKey(pr => pr.ProductId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(pr => pr.User).WithMany(u => u.Reviews).HasForeignKey(pr => pr.UserId).OnDelete(DeleteBehavior.Restrict);
    }
}

public class CartConfiguration : IEntityTypeConfiguration<Cart>
{
    public void Configure(EntityTypeBuilder<Cart> builder)
    {
        builder.ToTable("Carts");
        builder.HasKey(c => c.Id);
    }
}

public class CartItemConfiguration : IEntityTypeConfiguration<CartItem>
{
    public void Configure(EntityTypeBuilder<CartItem> builder)
    {
        builder.ToTable("CartItems");
        builder.HasKey(ci => ci.Id);
        builder.Property(ci => ci.Price).HasColumnType("decimal(18,2)");
        builder.HasOne(ci => ci.Cart).WithMany(c => c.Items).HasForeignKey(ci => ci.CartId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(ci => ci.Product).WithMany(p => p.CartItems).HasForeignKey(ci => ci.ProductId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(ci => ci.Variant).WithMany(v => v.CartItems).HasForeignKey(ci => ci.VariantId).OnDelete(DeleteBehavior.Restrict);
    }
}

public class WishlistConfiguration : IEntityTypeConfiguration<Wishlist>
{
    public void Configure(EntityTypeBuilder<Wishlist> builder)
    {
        builder.ToTable("Wishlists");
        builder.HasKey(w => w.Id);
    }
}

public class WishlistItemConfiguration : IEntityTypeConfiguration<WishlistItem>
{
    public void Configure(EntityTypeBuilder<WishlistItem> builder)
    {
        builder.ToTable("WishlistItems");
        builder.HasKey(wi => wi.Id);
        builder.HasOne(wi => wi.Wishlist).WithMany(w => w.Items).HasForeignKey(wi => wi.WishlistId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(wi => wi.Product).WithMany(p => p.WishlistItems).HasForeignKey(wi => wi.ProductId).OnDelete(DeleteBehavior.Restrict);
    }
}

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");
        builder.HasKey(o => o.Id);
        builder.Property(o => o.OrderNumber).IsRequired().HasMaxLength(50);
        builder.HasIndex(o => o.OrderNumber).IsUnique();
        builder.Property(o => o.Subtotal).HasColumnType("decimal(18,2)");
        builder.Property(o => o.Discount).HasColumnType("decimal(18,2)");
        builder.Property(o => o.Tax).HasColumnType("decimal(18,2)");
        builder.Property(o => o.Shipping).HasColumnType("decimal(18,2)");
        builder.Property(o => o.Total).HasColumnType("decimal(18,2)");
        builder.Property(o => o.ShippingAddress).IsRequired();
        builder.Property(o => o.TrackingNumber).HasMaxLength(100);
        builder.Property(o => o.Notes).HasMaxLength(500);
        builder.HasOne(o => o.User).WithMany(u => u.Orders).HasForeignKey(o => o.UserId);
        builder.HasOne(o => o.Coupon).WithMany(c => c.Orders).HasForeignKey(o => o.CouponId).OnDelete(DeleteBehavior.SetNull);
    }
}

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.ToTable("OrderItems");
        builder.HasKey(oi => oi.Id);
        builder.Property(oi => oi.ProductName).IsRequired().HasMaxLength(200);
        builder.Property(oi => oi.ProductImage).HasMaxLength(500);
        builder.Property(oi => oi.Price).HasColumnType("decimal(18,2)");
        builder.Property(oi => oi.Subtotal).HasColumnType("decimal(18,2)");
        builder.HasOne(oi => oi.Order).WithMany(o => o.Items).HasForeignKey(oi => oi.OrderId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(oi => oi.Product).WithMany(p => p.OrderItems).HasForeignKey(oi => oi.ProductId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(oi => oi.Variant).WithMany(v => v.OrderItems).HasForeignKey(oi => oi.VariantId).OnDelete(DeleteBehavior.Restrict);
    }
}

public class CouponConfiguration : IEntityTypeConfiguration<Coupon>
{
    public void Configure(EntityTypeBuilder<Coupon> builder)
    {
        builder.ToTable("Coupons");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Code).IsRequired().HasMaxLength(50);
        builder.HasIndex(c => c.Code).IsUnique();
        builder.Property(c => c.Description).HasMaxLength(200);
        builder.Property(c => c.DiscountValue).HasColumnType("decimal(18,2)");
        builder.Property(c => c.MinOrderAmount).HasColumnType("decimal(18,2)");
        builder.Property(c => c.MaxDiscountAmount).HasColumnType("decimal(18,2)");
    }
}

public class CouponUsageConfiguration : IEntityTypeConfiguration<CouponUsage>
{
    public void Configure(EntityTypeBuilder<CouponUsage> builder)
    {
        builder.ToTable("CouponUsages");
        builder.HasKey(cu => cu.Id);
        builder.HasOne(cu => cu.Coupon).WithMany(c => c.Usages).HasForeignKey(cu => cu.CouponId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(cu => cu.User).WithMany(u => u.CouponUsages).HasForeignKey(cu => cu.UserId).OnDelete(DeleteBehavior.Restrict);
    }
}
