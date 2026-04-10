using backend.DTOs;

namespace backend.Services
{
    public interface IProductService
    {
        Task<PagedResult<ProductResponseDto>> GetAllAsync(int page, int pageSize, CancellationToken cancellationToken = default);
        Task<ProductResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<ProductMutationResult> CreateAsync(CreateProductDto dto, CancellationToken cancellationToken = default);
        Task<ProductMutationResult> UpdateAsync(int id, UpdateProductDto dto, CancellationToken cancellationToken = default);
        Task<bool> SoftDeleteAsync(int id, CancellationToken cancellationToken = default);

        Task<PagedResult<ProductResponseDto>> SearchProductAsync(ProductListFilter f, CancellationToken cancellationToken = default);
    }
}