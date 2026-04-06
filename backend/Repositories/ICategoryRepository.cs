using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using backend.Models;

namespace backend.Repositories;

public interface ICategoryRepository
{
    Task<IReadOnlyList<Category>> GetAllActiveWithNonDeletedProductsAsync(
        CancellationToken cancellationToken = default);

    Task<Category?> GetActiveByIdWithNonDeletedProductsAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<Category?> GetTrackedActiveByIdAsync(int id, CancellationToken cancellationToken = default);

    Task AddAsync(Category entity, CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
