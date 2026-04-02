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
    {
        modelBuilder.Entity<Product>(e =>
        {
        e.HasOne(p => p.Category).WithMany(c => c.Products).HasForeignKey(p => p.CategoryId);
        e.Property(p => p.IsDeleted).HasDefaultValue(false);
        e.Property(p => p.Sku).IsRequired().HasMaxLength(50);
        e.HasIndex(p => p.Sku).IsUnique();
        e.Property(p => p.Barcode).HasMaxLength(32);
        e.HasIndex(p => p.Barcode).IsUnique().HasFilter("[Barcode] IS NOT NULL");
        });
        modelBuilder.Entity<ProductPrice>().HasOne(p => p.Product).WithMany(c => c.ProductPrices).HasForeignKey(p => p.ProductId);
        modelBuilder.Entity<ProductFeature>().HasOne(p => p.Product).WithMany(c => c.ProductFeatures).HasForeignKey(p => p.ProductId);
        modelBuilder.Entity<ProductFeature>().HasOne(p => p.Feature).WithMany(c => c.ProductFeatures).HasForeignKey(p => p.FeatureId);
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
    }

    
}
}