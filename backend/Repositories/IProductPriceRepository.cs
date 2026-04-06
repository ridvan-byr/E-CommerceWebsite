using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using backend.Models;

namespace backend.Repositories;

public interface IProductPriceRepository
{
    Task<IReadOnlyList<ProductPrice>> GetHistoryByProductIdAsync(
        int productId,
        CancellationToken cancellationToken = default);

    Task AddAsync(ProductPrice entity, CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
