using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly DataContext _context;

    public CategoryRepository(DataContext context)
    {
        _context = context;
    }

    /// <summary>Tüm aktif kategoriler; <see cref="Category.CreatedByUserId"/> ile filtrelenmez (sahiplik yok).</summary>
    public async Task<IReadOnlyList<Category>> GetAllActiveWithNonDeletedProductsAsync(
        CancellationToken cancellationToken = default)
    {
        return await _context.Categories
            .AsNoTracking()
            .Where(c => !c.IsDeleted)
            .Include(c => c.Products.Where(p => !p.IsDeleted))
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Category?> GetActiveByIdWithNonDeletedProductsAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return await _context.Categories
            .AsNoTracking()
            .Where(c => c.CategoryId == id && !c.IsDeleted)
            .Include(c => c.Products.Where(p => !p.IsDeleted))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<Category?> GetTrackedActiveByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Categories
            .FirstOrDefaultAsync(c => c.CategoryId == id && !c.IsDeleted, cancellationToken);
    }

    public async Task AddAsync(Category entity, CancellationToken cancellationToken = default)
    {
        await _context.Categories.AddAsync(entity, cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        _context.SaveChangesAsync(cancellationToken);
}
