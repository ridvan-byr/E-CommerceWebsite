using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class ProductFeatureRepository : IProductFeatureRepository
{
    private readonly DataContext _context;

    public ProductFeatureRepository(DataContext context)
    {
        _context = context;
    }

    public async Task AddAsync(ProductFeature productFeature, CancellationToken cancellationToken = default)
    {
        await _context.ProductFeatures.AddAsync(productFeature, cancellationToken);
    }

    public async Task<IReadOnlyList<ProductFeature>> GetByProductIdAsync(int productId, CancellationToken cancellationToken = default)
    {
        return await _context.ProductFeatures
            .AsNoTracking()
            .Include(pf => pf.Feature)
            .Where(pf => pf.ProductId == productId)
            .OrderBy(pf => pf.SortOrder)
            .ThenBy(pf => pf.ProductFeatureId)
            .ToListAsync(cancellationToken);
    }

    public async Task<ProductFeature?> GetByIdAsync(int productFeatureId, CancellationToken cancellationToken = default)
    {
        return await _context.ProductFeatures
            .AsNoTracking()
            .Include(pf => pf.Feature)
            .Include(pf => pf.Product)
            .FirstOrDefaultAsync(pf => pf.ProductFeatureId == productFeatureId, cancellationToken);
    }

    public Task<ProductFeature?> GetTrackedByIdAsync(int productFeatureId, CancellationToken cancellationToken = default)
    {
        return _context.ProductFeatures
            .FirstOrDefaultAsync(pf => pf.ProductFeatureId == productFeatureId, cancellationToken);
    }

    public Task<bool> ExistsAsync(int productId, int featureId, int? excludeProductFeatureId, CancellationToken cancellationToken = default)
    {
        var q = _context.ProductFeatures.AsNoTracking()
            .Where(pf => pf.ProductId == productId && pf.FeatureId == featureId);

        if (excludeProductFeatureId is int x)
            q = q.Where(pf => pf.ProductFeatureId != x);

        return q.AnyAsync(cancellationToken);
    }

    public void Remove(ProductFeature entity)
    {
        _context.ProductFeatures.Remove(entity);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        _context.SaveChangesAsync(cancellationToken);
}
