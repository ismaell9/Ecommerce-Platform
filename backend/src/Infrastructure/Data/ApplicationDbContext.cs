using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data.Configurations;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
    public DbSet<ProductSpecification> ProductSpecifications => Set<ProductSpecification>();
    public DbSet<ProductReview> ProductReviews => Set<ProductReview>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Wishlist> Wishlists => Set<Wishlist>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<CouponUsage> CouponUsages => Set<CouponUsage>();

    public IAsyncRepository<User> UsersRepo => new EfRepository<User>(this);
    public IAsyncRepository<Role> RolesRepo => new EfRepository<Role>(this);
    public IAsyncRepository<Category> CategoriesRepo => new EfRepository<Category>(this);
    public IAsyncRepository<Brand> BrandsRepo => new EfRepository<Brand>(this);
    public IAsyncRepository<Product> ProductsRepo => new EfRepository<Product>(this);
    public IAsyncRepository<ProductImage> ProductImagesRepo => new EfRepository<ProductImage>(this);
    public IAsyncRepository<ProductVariant> ProductVariantsRepo => new EfRepository<ProductVariant>(this);
    public IAsyncRepository<ProductSpecification> ProductSpecificationsRepo => new EfRepository<ProductSpecification>(this);
    public IAsyncRepository<ProductReview> ProductReviewsRepo => new EfRepository<ProductReview>(this);
    public IAsyncRepository<Cart> CartsRepo => new EfRepository<Cart>(this);
    public IAsyncRepository<CartItem> CartItemsRepo => new EfRepository<CartItem>(this);
    public IAsyncRepository<Wishlist> WishlistsRepo => new EfRepository<Wishlist>(this);
    public IAsyncRepository<WishlistItem> WishlistItemsRepo => new EfRepository<WishlistItem>(this);
    public IAsyncRepository<Order> OrdersRepo => new EfRepository<Order>(this);
    public IAsyncRepository<OrderItem> OrderItemsRepo => new EfRepository<OrderItem>(this);
    public IAsyncRepository<Coupon> CouponsRepo => new EfRepository<Coupon>(this);
    public IAsyncRepository<CouponUsage> CouponUsagesRepo => new EfRepository<CouponUsage>(this);

    IAsyncRepository<User> IApplicationDbContext.Users => UsersRepo;
    IAsyncRepository<Role> IApplicationDbContext.Roles => RolesRepo;
    IAsyncRepository<Category> IApplicationDbContext.Categories => CategoriesRepo;
    IAsyncRepository<Brand> IApplicationDbContext.Brands => BrandsRepo;
    IAsyncRepository<Product> IApplicationDbContext.Products => ProductsRepo;
    IAsyncRepository<ProductImage> IApplicationDbContext.ProductImages => ProductImagesRepo;
    IAsyncRepository<ProductVariant> IApplicationDbContext.ProductVariants => ProductVariantsRepo;
    IAsyncRepository<ProductSpecification> IApplicationDbContext.ProductSpecifications => ProductSpecificationsRepo;
    IAsyncRepository<ProductReview> IApplicationDbContext.ProductReviews => ProductReviewsRepo;
    IAsyncRepository<Cart> IApplicationDbContext.Carts => CartsRepo;
    IAsyncRepository<CartItem> IApplicationDbContext.CartItems => CartItemsRepo;
    IAsyncRepository<Wishlist> IApplicationDbContext.Wishlists => WishlistsRepo;
    IAsyncRepository<WishlistItem> IApplicationDbContext.WishlistItems => WishlistItemsRepo;
    IAsyncRepository<Order> IApplicationDbContext.Orders => OrdersRepo;
    IAsyncRepository<OrderItem> IApplicationDbContext.OrderItems => OrderItemsRepo;
    IAsyncRepository<Coupon> IApplicationDbContext.Coupons => CouponsRepo;
    IAsyncRepository<CouponUsage> IApplicationDbContext.CouponUsages => CouponUsagesRepo;

    public IUnitOfWork UnitOfWork => new UnitOfWork(this);

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new RoleConfiguration());
        modelBuilder.ApplyConfiguration(new UserRoleConfiguration());
        modelBuilder.ApplyConfiguration(new CategoryConfiguration());
        modelBuilder.ApplyConfiguration(new BrandConfiguration());
        modelBuilder.ApplyConfiguration(new ProductConfiguration());
        modelBuilder.ApplyConfiguration(new ProductImageConfiguration());
        modelBuilder.ApplyConfiguration(new ProductVariantConfiguration());
        modelBuilder.ApplyConfiguration(new ProductSpecificationConfiguration());
        modelBuilder.ApplyConfiguration(new ProductReviewConfiguration());
        modelBuilder.ApplyConfiguration(new CartConfiguration());
        modelBuilder.ApplyConfiguration(new CartItemConfiguration());
        modelBuilder.ApplyConfiguration(new WishlistConfiguration());
        modelBuilder.ApplyConfiguration(new WishlistItemConfiguration());
        modelBuilder.ApplyConfiguration(new OrderConfiguration());
        modelBuilder.ApplyConfiguration(new OrderItemConfiguration());
        modelBuilder.ApplyConfiguration(new CouponConfiguration());
        modelBuilder.ApplyConfiguration(new CouponUsageConfiguration());
    }
}
