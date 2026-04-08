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

        var feature = await _featureRepository.GetFeatureByIdAsync(dto.FeatureId, cancellationToken);
        if (feature is null)
            return null;

        if (await _productFeatureRepository.ExistsAsync(productId, dto.FeatureId, null, cancellationToken))
            return null;

        var sortOrder = dto.SortOrder ?? await NextSortOrderAsync(productId, cancellationToken);

        var entity = new ProductFeature
        {
            ProductId = productId,
            FeatureId = dto.FeatureId,
            Value = dto.Value,
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

        pf.Value = dto.Value;
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
