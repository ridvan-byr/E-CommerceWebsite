using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly DataContext _context;

    public ProductRepository(DataContext context)
    {
        _context = context;
    }

    public Task<Product?> GetActiveByIdAsync(int id, CancellationToken cancellationToken = default) =>
        _context.Products
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.ProductId == id && !c.IsDeleted, cancellationToken);

    public async Task<Product?> GetTrackedActiveByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products.FindAsync(new object[] { id }, cancellationToken);
        if (product is null || product.IsDeleted)
            return null;
        return product;
    }

    public Task<bool> CategoryExistsActiveAsync(int categoryId, CancellationToken cancellationToken = default) =>
        _context.Categories.AsNoTracking()
            .AnyAsync(c => c.CategoryId == categoryId && !c.IsDeleted, cancellationToken);

    public Task<bool> IsBarcodeTakenAsync(string barcode, int? excludeProductId, CancellationToken cancellationToken = default)
    {
        var q = _context.Products
            .AsNoTracking()
            .Where(c => c.Barcode == barcode);

        if (excludeProductId is int x)
            q = q.Where(p => p.ProductId != x);

        return q.AnyAsync(cancellationToken);
    }

    public async Task AddAsync(Product product, CancellationToken cancellationToken = default)
    {
        await _context.Products.AddAsync(product, cancellationToken);
    }

    public Task UpdateAsync(Product product, CancellationToken cancellationToken = default)
    {
        _context.Products.Update(product);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken) =>
        _context.SaveChangesAsync(cancellationToken);

    public async Task<(IReadOnlyList<Product> Items, int TotalCount)> SearchAsync(
        ProductListFilter f,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Products
            .AsNoTracking()
            .Where(c => !c.IsDeleted);

        if (!string.IsNullOrWhiteSpace(f.Search))
        {
            var s = f.Search.Trim();
            query = query.Where(p =>
                p.Name.Contains(s)
                || (p.Sku != null && p.Sku.Contains(s))
                || (p.Description != null && p.Description.Contains(s)));
        }

        if (f.CategoryId is int cid)
            query = query.Where(p => p.CategoryId == cid);

        if (!string.IsNullOrWhiteSpace(f.Status))
            query = query.Where(p => p.Status == f.Status);

        if (f.MinPrice is decimal minP)
            query = query.Where(p => p.Price >= minP);

        if (f.MaxPrice is decimal maxP)
            query = query.Where(p => p.Price <= maxP);

        if (f.MinStock is int minS)
            query = query.Where(p => p.Stock >= minS);

        var total = await query.CountAsync(cancellationToken);

        var page = Math.Max(1, f.Page);
        var size = Math.Clamp(f.PageSize, 1, 100);

        var items = await query
            .OrderBy(p => p.Name)
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync(cancellationToken);

        return (items, total);
    }
}
