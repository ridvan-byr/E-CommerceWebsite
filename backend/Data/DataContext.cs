using Microsoft.EntityFrameworkCore;
using backend.Models;
namespace backend.Data;

public class DataContext : DbContext{
    public DataContext(DbContextOptions<DataContext> options) : base(options)
    {
    }
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<User> Users => Set<User>();
    public DbSet<ProductPrice> ProductPrices => Set<ProductPrice>();
    public DbSet<ProductFeature> ProductFeatures => Set<ProductFeature>();
    public DbSet<Feature> Features => Set<Feature>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Product>(e =>
        {
        e.HasOne(p => p.Category).WithMany(c => c.Products).HasForeignKey(p => p.CategoryId);
        e.Property(p => p.IsDeleted).HasDefaultValue(false);
        e.Property(p => p.Sku).IsRequired().HasMaxLength(50);
        // Unique among active rows only — soft-deleted products free SKU/barcode for reuse.
        e.HasIndex(p => p.Sku).IsUnique().HasFilter("[IsDeleted] = 0");
        e.Property(p => p.Barcode).HasMaxLength(14);
        e.HasIndex(p => p.Barcode)
            .IsUnique()
            .HasFilter("[Barcode] IS NOT NULL AND [IsDeleted] = 0");
        e.Property(p => p.Price).HasPrecision(18, 2);
        e.Property(p => p.OriginalPrice).HasPrecision(18, 2);
        });
        modelBuilder.Entity<ProductPrice>(e =>
        {
            e.HasOne(p => p.Product).WithMany(c => c.ProductPrices).HasForeignKey(p => p.ProductId);
            e.Property(p => p.Price).HasPrecision(18, 2);
            e.Property(p => p.OriginalPrice).HasPrecision(18, 2);
        });

        modelBuilder.Entity<ProductFeature>(e =>
        {
            e.HasOne(p => p.Product).WithMany(c => c.ProductFeatures).HasForeignKey(p => p.ProductId);
            e.HasOne(p => p.Feature).WithMany(c => c.ProductFeatures).HasForeignKey(p => p.FeatureId);
            e.Property(p => p.Value).IsRequired().HasMaxLength(500);
            e.HasIndex(p => new { p.ProductId, p.FeatureId }).IsUnique();
        });
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<User>()
            .HasIndex(u => u.FirebaseUid)
            .IsUnique()
            .HasFilter("[FirebaseUid] IS NOT NULL");

        modelBuilder.Entity<Feature>(e =>
        {
            e.Property(f => f.Name).IsRequired().HasMaxLength(100);
            e.Property(f => f.IsDeleted).HasDefaultValue(false);
            e.HasIndex(f => f.Name)
                .IsUnique()
                .HasFilter("[IsDeleted] = 0");
        });
    }
}