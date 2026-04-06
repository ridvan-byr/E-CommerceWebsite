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
        var category = await _context.Categories.FindAsync(new object[] { id }, cancellationToken);
        if (category is null || category.IsDeleted)
            return null;
        return category;
    }

    public async Task AddAsync(Category entity, CancellationToken cancellationToken = default)
    {
        await _context.Categories.AddAsync(entity, cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        _context.SaveChangesAsync(cancellationToken);
}
