using System.Threading;
using System.Threading.Tasks;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class CategoryService : ICategoryService
{
    private readonly DataContext _context;

    public CategoryService(DataContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<CategoryResponseDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Categories
            .AsNoTracking()
            .Where(c => !c.IsDeleted)
            .OrderBy(c => c.Name)
            .Select(c => new CategoryResponseDto
            {
                CategoryId = c.CategoryId,
                Name = c.Name,
                Description = c.Description,
                ImageUrl = c.ImageUrl,
                ProductCount = c.Products.Count(p => !p.IsDeleted),
                IsDeleted = c.IsDeleted,
                CreatedBy = c.CreatedBy,
                CreatedAt = c.CreatedAt,
                UpdatedBy = c.UpdatedBy,
                UpdatedAt = c.UpdatedAt,
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<CategoryResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Categories
            .AsNoTracking()
            .Where(c => c.CategoryId == id && !c.IsDeleted)
            .Select(c => new CategoryResponseDto
            {
                CategoryId = c.CategoryId,
                Name = c.Name,
                Description = c.Description,
                ImageUrl = c.ImageUrl,
                ProductCount = c.Products.Count(p => !p.IsDeleted),
                IsDeleted = c.IsDeleted,
                CreatedBy = c.CreatedBy,
                CreatedAt = c.CreatedAt,
                UpdatedBy = c.UpdatedBy,
                UpdatedAt = c.UpdatedAt,
            })
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<CategoryResponseDto> CreateAsync(CreateCategoryDto dto, CancellationToken cancellationToken = default)
    {
        var category = new Category
        {
            Name = dto.Name,
            Description = dto.Description,
            ImageUrl = dto.ImageUrl,
            CreatedBy = "System",
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false,
            UpdatedAt = null,
            UpdatedBy = null,
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync(cancellationToken);

        return new CategoryResponseDto
        {
            CategoryId = category.CategoryId,
            Name = category.Name,
            Description = category.Description,
            ImageUrl = category.ImageUrl,
            ProductCount = 0,
            IsDeleted = category.IsDeleted,
            CreatedBy = category.CreatedBy,
            CreatedAt = category.CreatedAt,
            UpdatedBy = category.UpdatedBy,
            UpdatedAt = category.UpdatedAt,
        };
    }

    public async Task<CategoryResponseDto?> UpdateAsync(int id, UpdateCategoryDto dto, CancellationToken cancellationToken = default)
    {
        var category = await _context.Categories.FindAsync(new object[] { id }, cancellationToken);
        if (category is null || category.IsDeleted)
        {
            return null;
        }

        category.Name = dto.Name;
        category.Description = dto.Description;
        category.ImageUrl = dto.ImageUrl;
        category.UpdatedAt = DateTime.UtcNow;
        category.UpdatedBy = "System";

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<bool> SoftDeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var category = await _context.Categories.FindAsync(new object[] { id }, cancellationToken);
        if (category is null || category.IsDeleted)
        {
            return false;
        }

        category.IsDeleted = true;
        category.UpdatedAt = DateTime.UtcNow;
        category.UpdatedBy = "System";
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
