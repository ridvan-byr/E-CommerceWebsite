using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class FeatureRepository : IFeatureRepository
{
    private readonly DataContext _context;

    public FeatureRepository(DataContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Feature feature, CancellationToken cancellationToken = default)
    {
        await _context.Features.AddAsync(feature, cancellationToken);
    }

    public async Task<IReadOnlyList<Feature>> GetAllActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Features
            .AsNoTracking()
            .Where(c => !c.IsDeleted)
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);
    }

    public Task<Feature?> GetFeatureByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return _context.Features
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.FeatureId == id && !c.IsDeleted, cancellationToken);
    }

    public async Task<Feature?> GetTrackedActiveByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Features
            .FirstOrDefaultAsync(c => c.FeatureId == id && !c.IsDeleted, cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        await _context.SaveChangesAsync(cancellationToken);
}
