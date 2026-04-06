using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories
{
    public class ProductPriceRepository : IProductPriceRepository
    {
        private readonly DataContext _context;

        public ProductPriceRepository(DataContext context)
        {
            _context = context;
        }
        
        public async Task<IReadOnlyList<ProductPrice>> GetHistoryByProductIdAsync(int id,CancellationToken cancellationToken = default)
        {
          return await _context.ProductPrices
          .AsNoTracking()
          .Where(c => c.ProductId == id)
          .OrderByDescending(c => c.CreatedAt)
          .ToListAsync(cancellationToken);
          
        }
        

        public async Task AddAsync(ProductPrice entity, CancellationToken cancellationToken = default)
        {
            await _context.ProductPrices.AddAsync(entity, cancellationToken);
        }

        public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
            _context.SaveChangesAsync(cancellationToken);
    }
}