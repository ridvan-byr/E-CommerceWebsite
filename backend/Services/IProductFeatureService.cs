using backend.DTOs;

namespace backend.Services;

public interface IProductFeatureService
{
    Task<IReadOnlyList<ProductFeatureResponseDto>?> GetByProductIdAsync(int productId, CancellationToken cancellationToken = default);

    Task<ProductFeatureResponseDto?> GetByIdAsync(int productId, int productFeatureId, CancellationToken cancellationToken = default);

    Task<ProductFeatureResponseDto?> CreateAsync(int productId, CreateProductFeatureDto dto, CancellationToken cancellationToken = default);

    Task<ProductFeatureResponseDto?> UpdateAsync(int productId, int productFeatureId, UpdateProductFeatureDto dto, CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(int productId, int productFeatureId, CancellationToken cancellationToken = default);
}
