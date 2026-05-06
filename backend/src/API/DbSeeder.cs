using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace API;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        await context.Database.EnsureCreatedAsync();

        if (await context.Roles.AnyAsync()) return;

        // Roles
        var adminRole = new Role { Id = Guid.NewGuid(), Name = "Admin", Description = "Administrator" };
        var customerRole = new Role { Id = Guid.NewGuid(), Name = "Customer", Description = "Customer" };
        await context.Roles.AddRangeAsync(adminRole, customerRole);
        await context.SaveChangesAsync();

        // Admin user (password: Admin@123)
        var adminUser = new User
        {
            Id = Guid.NewGuid(),
            FirstName = "Admin",
            LastName = "User",
            Email = "admin@shophub.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123", 12),
            IsEmailVerified = true,
            IsActive = true
        };
        await context.Users.AddAsync(adminUser);

        await context.UserRoles.AddAsync(new UserRole { UserId = adminUser.Id, RoleId = adminRole.Id });
        await context.SaveChangesAsync();

        // Customer user (password: Customer@123)
        var customerUser = new User
        {
            Id = Guid.NewGuid(),
            FirstName = "John",
            LastName = "Doe",
            Email = "john@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Customer@123", 12),
            IsEmailVerified = true,
            IsActive = true
        };
        await context.Users.AddAsync(customerUser);
        await context.UserRoles.AddAsync(new UserRole { UserId = customerUser.Id, RoleId = customerRole.Id });
        await context.Carts.AddAsync(new Cart { Id = Guid.NewGuid(), UserId = customerUser.Id });
        await context.Wishlists.AddAsync(new Wishlist { Id = Guid.NewGuid(), UserId = customerUser.Id });
        await context.SaveChangesAsync();

        // Categories
        var categories = new List<Category>
        {
            new() { Id = Guid.NewGuid(), Name = "Electronics", Slug = "electronics", Description = "Electronic devices and gadgets" },
            new() { Id = Guid.NewGuid(), Name = "Clothing", Slug = "clothing", Description = "Fashion and apparel" },
            new() { Id = Guid.NewGuid(), Name = "Books", Slug = "books", Description = "Physical and digital books" },
            new() { Id = Guid.NewGuid(), Name = "Home & Garden", Slug = "home-garden", Description = "Home improvement and garden supplies" },
        };
        await context.Categories.AddRangeAsync(categories);
        await context.SaveChangesAsync();

        // Brands
        var brands = new List<Brand>
        {
            new() { Id = Guid.NewGuid(), Name = "TechPro", Slug = "techpro", Description = "Premium tech products" },
            new() { Id = Guid.NewGuid(), Name = "StyleCraft", Slug = "stylecraft", Description = "Fashion brand" },
        };
        await context.Brands.AddRangeAsync(brands);
        await context.SaveChangesAsync();

        // Products
        var products = new List<Product>
        {
            new()
            {
                Id = Guid.NewGuid(), Name = "Wireless Bluetooth Headphones", Slug = "wireless-bluetooth-headphones",
                Description = "Premium noise-cancelling wireless headphones with 30-hour battery life.",
                ShortDescription = "Premium noise-cancelling headphones",
                Price = 79.99m, OriginalPrice = 99.99m, Stock = 50, Sku = "WBH-001",
                CategoryId = categories[0].Id, BrandId = brands[0].Id, IsActive = true,
                AverageRating = 4.5m, ReviewCount = 128, CreatedAt = DateTime.UtcNow.AddDays(-30)
            },
            new()
            {
                Id = Guid.NewGuid(), Name = "Smart Watch Pro", Slug = "smart-watch-pro",
                Description = "Advanced smartwatch with health monitoring, GPS, and 7-day battery.",
                ShortDescription = "Advanced smartwatch",
                Price = 199.99m, OriginalPrice = 249.99m, Stock = 30, Sku = "SWP-001",
                CategoryId = categories[0].Id, BrandId = brands[0].Id, IsActive = true,
                AverageRating = 4.7m, ReviewCount = 256, CreatedAt = DateTime.UtcNow.AddDays(-20)
            },
            new()
            {
                Id = Guid.NewGuid(), Name = "Classic Cotton T-Shirt", Slug = "classic-cotton-t-shirt",
                Description = "Comfortable 100% cotton t-shirt available in multiple colors.",
                ShortDescription = "Classic cotton tee",
                Price = 24.99m, Stock = 200, Sku = "CCT-001",
                CategoryId = categories[1].Id, BrandId = brands[1].Id, IsActive = true,
                AverageRating = 4.2m, ReviewCount = 89, CreatedAt = DateTime.UtcNow.AddDays(-15)
            },
            new()
            {
                Id = Guid.NewGuid(), Name = "Mechanical Keyboard RGB", Slug = "mechanical-keyboard-rgb",
                Description = "Full-size mechanical keyboard with customizable RGB backlighting and Cherry MX switches.",
                ShortDescription = "RGB mechanical keyboard",
                Price = 129.99m, OriginalPrice = 159.99m, Stock = 25, Sku = "MKR-001",
                CategoryId = categories[0].Id, BrandId = brands[0].Id, IsActive = true,
                AverageRating = 4.8m, ReviewCount = 312, CreatedAt = DateTime.UtcNow.AddDays(-10)
            },
            new()
            {
                Id = Guid.NewGuid(), Name = "Running Shoes Elite", Slug = "running-shoes-elite",
                Description = "Lightweight running shoes with responsive cushioning and breathable mesh upper.",
                ShortDescription = "Lightweight running shoes",
                Price = 149.99m, OriginalPrice = 179.99m, Stock = 40, Sku = "RSE-001",
                CategoryId = categories[1].Id, BrandId = brands[1].Id, IsActive = true,
                AverageRating = 4.6m, ReviewCount = 178, CreatedAt = DateTime.UtcNow.AddDays(-5)
            },
            new()
            {
                Id = Guid.NewGuid(), Name = "Bestseller Novel Collection", Slug = "bestseller-novel-collection",
                Description = "A curated collection of this year's bestselling novels.",
                ShortDescription = "Bestseller novel collection",
                Price = 39.99m, Stock = 100, Sku = "BNC-001",
                CategoryId = categories[2].Id, IsActive = true,
                AverageRating = 4.3m, ReviewCount = 67, CreatedAt = DateTime.UtcNow.AddDays(-3)
            },
        };
        await context.Products.AddRangeAsync(products);
        await context.SaveChangesAsync();

        // Product images (using placeholder URLs)
        var images = new List<ProductImage>();
        foreach (var product in products)
        {
            images.Add(new ProductImage
            {
                Id = Guid.NewGuid(), ProductId = product.Id,
                Url = $"https://picsum.photos/seed/{product.Sku}/400/400",
                AltText = product.Name, IsPrimary = true, Order = 1
            });
        }
        await context.ProductImages.AddRangeAsync(images);

        // Coupons
        var coupon = new Coupon
        {
            Id = Guid.NewGuid(), Code = "WELCOME10", Description = "Welcome discount - 10% off",
            DiscountType = DiscountType.Percentage, DiscountValue = 10, MinOrderAmount = 50,
            MaxDiscountAmount = 50, ValidFrom = DateTime.UtcNow, ValidTo = DateTime.UtcNow.AddMonths(6),
            IsActive = true
        };
        await context.Coupons.AddAsync(coupon);

        await context.SaveChangesAsync();
    }
}
