using backend.Models;

namespace backend.Repositories;

public interface IProductFeatureRepository
{
    Task<IReadOnlyList<ProductFeature>> GetByProductIdAsync(int productId, CancellationToken cancellationToken = default);

    Task<ProductFeature?> GetByIdAsync(int productFeatureId, CancellationToken cancellationToken = default);

    Task<ProductFeature?> GetTrackedByIdAsync(int productFeatureId, CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(int productId, int featureId, int? excludeProductFeatureId, CancellationToken cancellationToken = default);

    Task AddAsync(ProductFeature productFeature, CancellationToken cancellationToken = default);

    void Remove(ProductFeature entity);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
