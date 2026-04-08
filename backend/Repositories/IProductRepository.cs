using System.Collections.Generic;
using backend.DTOs;
using backend.Models;

namespace backend.Repositories;

public interface IProductRepository
{
    Task<Product?> GetActiveByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Product?> GetTrackedActiveByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> CategoryExistsActiveAsync(int categoryId, CancellationToken cancellationToken = default);
    Task<bool> IsBarcodeTakenAsync(string barcode, int? excludeProductId, CancellationToken ct = default);
    Task<string?> GetCategoryNameAsync(int categoryId, CancellationToken cancellationToken = default);
    Task<IReadOnlyDictionary<int, string>> GetCategoryNamesByIdsAsync(
        IEnumerable<int> categoryIds,
        CancellationToken cancellationToken = default);
    Task AddAsync(Product product, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Product> Items, int TotalCount)> SearchAsync(ProductListFilter f, CancellationToken cancellationToken = default);
}
