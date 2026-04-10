using backend.DTOs;
using backend.Models;
using backend.Repositories;

namespace backend.Services;

public class ProductFeatureService : IProductFeatureService
{
    private readonly IProductFeatureRepository _productFeatureRepository;
    private readonly IProductRepository _productRepository;
    private readonly IFeatureRepository _featureRepository;

    public ProductFeatureService(
        IProductFeatureRepository productFeatureRepository,
        IProductRepository productRepository,
        IFeatureRepository featureRepository)
    {
        _productFeatureRepository = productFeatureRepository;
        _productRepository = productRepository;
        _featureRepository = featureRepository;
    }

    public async Task<IReadOnlyList<ProductFeatureResponseDto>?> GetByProductIdAsync(int productId, CancellationToken cancellationToken = default)
    {
        var product = await _productRepository.GetActiveByIdAsync(productId, cancellationToken);
        if (product is null)
            return null;

        var rows = await _productFeatureRepository.GetByProductIdAsync(productId, cancellationToken);
        return rows.Select(pf => new ProductFeatureResponseDto(pf)).ToList();
    }

    public async Task<ProductFeatureResponseDto?> GetByIdAsync(int productId, int productFeatureId, CancellationToken cancellationToken = default)
    {
        var pf = await _productFeatureRepository.GetByIdAsync(productFeatureId, cancellationToken);
        if (pf is null || pf.ProductId != productId)
            return null;

        return new ProductFeatureResponseDto(pf);
    }

    public async Task<ProductFeatureResponseDto?> CreateAsync(int productId, CreateProductFeatureDto dto, CancellationToken cancellationToken = default)
    {
        var product = await _productRepository.GetActiveByIdAsync(productId, cancellationToken);
        if (product is null)
            return null;

        var feature = await _featureRepository.GetOrCreateActiveByNameAsync(dto.Name, cancellationToken);

        if (await _productFeatureRepository.ExistsAsync(productId, feature.FeatureId, null, cancellationToken))
            return null;

        var sortOrder = dto.SortOrder ?? await NextSortOrderAsync(productId, cancellationToken);

        var entity = new ProductFeature
        {
            ProductId = productId,
            FeatureId = feature.FeatureId,
            Value = dto.Value.Trim(),
            SortOrder = sortOrder,
            CreatedBy = "System",
            CreatedAt = DateTime.UtcNow,
        };

        await _productFeatureRepository.AddAsync(entity, cancellationToken);
        await _productFeatureRepository.SaveChangesAsync(cancellationToken);

        var loaded = await _productFeatureRepository.GetByIdAsync(entity.ProductFeatureId, cancellationToken);
        return loaded is null ? null : new ProductFeatureResponseDto(loaded);
    }

    public async Task<ProductFeatureResponseDto?> UpdateAsync(
        int productId,
        int productFeatureId,
        UpdateProductFeatureDto dto,
        CancellationToken cancellationToken = default)
    {
        var pf = await _productFeatureRepository.GetTrackedByIdAsync(productFeatureId, cancellationToken);
        if (pf is null || pf.ProductId != productId)
            return null;

        if (!string.IsNullOrWhiteSpace(dto.Name))
        {
            var want = dto.Name.Trim();
            var current = await _featureRepository.GetFeatureByIdAsync(pf.FeatureId, cancellationToken);
            var currentName = current?.Name.Trim() ?? string.Empty;
            if (!string.Equals(want, currentName, StringComparison.OrdinalIgnoreCase))
            {
                var feature = await _featureRepository.GetOrCreateActiveByNameAsync(want, cancellationToken);
                if (feature.FeatureId != pf.FeatureId
                    && await _productFeatureRepository.ExistsAsync(productId, feature.FeatureId, productFeatureId, cancellationToken))
                    return null;

                pf.FeatureId = feature.FeatureId;
            }
        }

        pf.Value = dto.Value.Trim();
        pf.SortOrder = dto.SortOrder;
        pf.UpdatedAt = DateTime.UtcNow;
        pf.UpdatedBy = "System";

        await _productFeatureRepository.SaveChangesAsync(cancellationToken);

        var loaded = await _productFeatureRepository.GetByIdAsync(productFeatureId, cancellationToken);
        return loaded is null ? null : new ProductFeatureResponseDto(loaded);
    }

    public async Task<bool> DeleteAsync(int productId, int productFeatureId, CancellationToken cancellationToken = default)
    {
        var pf = await _productFeatureRepository.GetTrackedByIdAsync(productFeatureId, cancellationToken);
        if (pf is null || pf.ProductId != productId)
            return false;

        _productFeatureRepository.Remove(pf);
        await _productFeatureRepository.SaveChangesAsync(cancellationToken);
        return true;
    }

    private async Task<int> NextSortOrderAsync(int productId, CancellationToken cancellationToken)
    {
        var list = await _productFeatureRepository.GetByProductIdAsync(productId, cancellationToken);
        return list.Count == 0 ? 0 : list.Max(pf => pf.SortOrder) + 1;
    }
}
