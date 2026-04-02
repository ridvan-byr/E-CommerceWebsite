using backend.DTOs;
using backend.Repositories;

namespace backend.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;

    public ProductService(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<PagedResult<ProductResponseDto>> GetAllAsync(int page = 1, int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var filter = new ProductListFilter { Page = page, PageSize = pageSize };
        return await _productRepository.SearchProductAsync(filter, cancellationToken);
    }

    public Task<ProductResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => _productRepository.GetByIdAsync(id, cancellationToken);

    public Task<ProductResponseDto?> CreateAsync(CreateProductDto dto, CancellationToken cancellationToken = default)
        => _productRepository.CreateAsync(dto, cancellationToken);

    public Task<ProductResponseDto?> UpdateAsync(int id, UpdateProductDto dto, CancellationToken cancellationToken = default)
        => _productRepository.UpdateAsync(id, dto, cancellationToken);

    public Task<bool> SoftDeleteAsync(int id, CancellationToken cancellationToken = default)
        => _productRepository.SoftDeleteAsync(id, cancellationToken);

    public Task<PagedResult<ProductResponseDto>> SearchProductAsync(ProductListFilter f, CancellationToken cancellationToken = default)
        => _productRepository.SearchProductAsync(f, cancellationToken);
}
