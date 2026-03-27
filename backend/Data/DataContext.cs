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
        modelBuilder.Entity<Product>().HasOne(p => p.Category).WithMany(c => c.Products).HasForeignKey(p => p.CategoryId);
        modelBuilder.Entity<Product>().Property(p => p.IsDeleted).HasDefaultValue(false);
        modelBuilder.Entity<ProductPrice>().HasOne(p => p.Product).WithMany(c => c.ProductPrices).HasForeignKey(p => p.ProductId);
        modelBuilder.Entity<ProductFeature>().HasOne(p => p.Product).WithMany(c => c.ProductFeatures).HasForeignKey(p => p.ProductId);
        modelBuilder.Entity<ProductFeature>().HasOne(p => p.Feature).WithMany(c => c.ProductFeatures).HasForeignKey(p => p.FeatureId);
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
    }

    
}
}