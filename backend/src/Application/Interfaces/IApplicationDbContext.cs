using Domain.Entities;

namespace Application.Interfaces;

public interface IApplicationDbContext
{
    IAsyncRepository<User> Users { get; }
    IAsyncRepository<Role> Roles { get; }
    IAsyncRepository<Category> Categories { get; }
    IAsyncRepository<Brand> Brands { get; }
    IAsyncRepository<Product> Products { get; }
    IAsyncRepository<ProductImage> ProductImages { get; }
    IAsyncRepository<ProductVariant> ProductVariants { get; }
    IAsyncRepository<ProductSpecification> ProductSpecifications { get; }
    IAsyncRepository<ProductReview> ProductReviews { get; }
    IAsyncRepository<Cart> Carts { get; }
    IAsyncRepository<CartItem> CartItems { get; }
    IAsyncRepository<Wishlist> Wishlists { get; }
    IAsyncRepository<WishlistItem> WishlistItems { get; }
    IAsyncRepository<Order> Orders { get; }
    IAsyncRepository<OrderItem> OrderItems { get; }
    IAsyncRepository<Coupon> Coupons { get; }
    IAsyncRepository<CouponUsage> CouponUsages { get; }
    IUnitOfWork UnitOfWork { get; }
}
