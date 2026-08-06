using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly DataContext _context;

    public ProductRepository(DataContext context)
    {
        _context = context;
    }

    public async Task<Product?> GetActiveByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.ProductFeatures)
                .ThenInclude(pf => pf.Feature)
            .FirstOrDefaultAsync(p => p.ProductId == id && !p.IsDeleted, cancellationToken);
    }

    public async Task<Product?> GetTrackedActiveByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products.FindAsync(new object[] { id }, cancellationToken);
        if (product is null || product.IsDeleted)
            return null;
        return product;
    }

    // REVIEW [C1] Bu metod kategori tablosunu sorguluyor ama burası
    // ProductRepository. Single Responsibility (SOLID-S) ihlali: bir
    // repository sadece kendi aggregate'inin verisinden sorumlu olmalı.
    // ProductService bir "kategori var mı?" kontrolüne ihtiyaç duyuyorsa,
    // bunu ICategoryRepository'den almalı:
    //
    //     // CategoryRepository.cs zaten var; bu metodu oraya taşı.
    //     // ProductService constructor'a ICategoryRepository ekle.
    //     // Çağrı:
    //     //   var ok = await _categoryRepository.ExistsActiveAsync(...)
    //
    // Aynı yorum aşağıdaki GetCategoryNameAsync ve GetCategoryNamesByIdsAsync
    // için de geçerli. Hepsi ICategoryRepository'nin işi.
    //
    // Repository sınırlarını net çizmenin pratik faydası: testlerde mock'lamak
    // kolaylaşır, hangi repository hangi tablodan sorumlu hızlı anlaşılır,
    // değişiklik etkisi öngörülebilir olur.
    //
    // Anahtar kelime: "Single Responsibility Principle", "aggregate root DDD".
    public Task<bool> CategoryExistsActiveAsync(int categoryId, CancellationToken cancellationToken = default) =>
        _context.Categories.AsNoTracking()
            .AnyAsync(c => c.CategoryId == categoryId && !c.IsDeleted, cancellationToken);

    public Task<bool> IsBarcodeTakenAsync(string barcode, int? excludeProductId, CancellationToken cancellationToken = default)
    {
        var q = _context.Products
            .AsNoTracking()
            .Where(p => p.Barcode == barcode && !p.IsDeleted);

        if (excludeProductId is int x)
            q = q.Where(p => p.ProductId != x);

        return q.AnyAsync(cancellationToken);
    }

    public Task<bool> IsSkuTakenAsync(string sku, int? excludeProductId, CancellationToken cancellationToken = default)
    {
        var q = _context.Products
            .AsNoTracking()
            .Where(p => p.Sku == sku && !p.IsDeleted);

        if (excludeProductId is int x)
            q = q.Where(p => p.ProductId != x);

        return q.AnyAsync(cancellationToken);
    }

    public Task<string?> GetCategoryNameAsync(int categoryId, CancellationToken cancellationToken = default) =>
        _context.Categories.AsNoTracking()
            .Where(c => c.CategoryId == categoryId && !c.IsDeleted)
            .Select(c => c.Name)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<IReadOnlyDictionary<int, string>> GetCategoryNamesByIdsAsync(
        IEnumerable<int> categoryIds,
        CancellationToken cancellationToken = default)
    {
        var ids = categoryIds.Distinct().ToHashSet();
        if (ids.Count == 0)
            return new Dictionary<int, string>();

        // REVIEW [B5] Aşağıdaki iki satır dead code:
        //
        //     var idsList = ids.ToList();
        //     if (idsList.Count == 0) return new Dictionary<int, string>();
        //
        // İlk `if (ids.Count == 0)` kontrolünden geçtiyse `Count > 0` zaten
        // garanti — ikinci kontrol asla `true` olamaz. `idsList`'e de gerek
        // yok çünkü `HashSet<int>` `Contains` için zaten verimli ve LINQ
        // `Contains` çağrısı `IEnumerable<int>` ile çalışıyor.
        //
        // Sadeleştirilmiş hali:
        //
        //     var rows = await _context.Categories.AsNoTracking()
        //         .Where(c => !c.IsDeleted && ids.Contains(c.CategoryId))
        //         .Select(c => new { c.CategoryId, c.Name })
        //         .ToListAsync(cancellationToken);
        //
        // Genel ipucu: kod review'larında "bu satır olmasa ne değişir?" diye sor.
        // Cevap "hiçbir şey" ise sil. Codebase'de gürültü, asıl iş mantığını
        // okumayı zorlaştırır.
        var idsList = ids.ToList();
        if (idsList.Count == 0) return new Dictionary<int, string>();

        var rows = await _context.Categories.AsNoTracking()
            .Where(c => !c.IsDeleted && idsList.Contains(c.CategoryId))
            .Select(c => new { c.CategoryId, c.Name })
            .ToListAsync(cancellationToken);

        return rows.ToDictionary(x => x.CategoryId, x => x.Name);
    }

    public async Task AddAsync(Product product, CancellationToken cancellationToken = default)
    {
        await _context.Products.AddAsync(product, cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken) =>
        _context.SaveChangesAsync(cancellationToken);

    /// <summary>Ürün araması; oluşturan/güncelleyen kullanıcıya göre kısıtlanmaz.</summary>
    public async Task<(IReadOnlyList<Product> Items, int TotalCount)> SearchAsync(
        ProductListFilter f,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Products
            .AsNoTracking()
            .Include(p => p.Category)   // INNER JOIN Products → Categories
            .Where(c => !c.IsDeleted);

        if (!string.IsNullOrWhiteSpace(f.Search))
        {
            var s = f.Search.Trim();
            query = query.Where(p =>
                p.Name.Contains(s)
                || (p.Sku != null && p.Sku.Contains(s))
                || (p.Barcode != null && p.Barcode.Contains(s))
                || (p.Description != null && p.Description.Contains(s)));
        }

        if (f.CategoryId is int cid)
            query = query.Where(p => p.CategoryId == cid);

        if (!string.IsNullOrWhiteSpace(f.Status))
            query = query.Where(p => p.Status == f.Status);

        if (f.MinPrice is decimal minP)
            query = query.Where(p => p.Price >= minP);

        if (f.MaxPrice is decimal maxP)
            query = query.Where(p => p.Price <= maxP);

        if (f.MinStock is int minS)
            query = query.Where(p => p.Stock >= minS);

        var total = await query.CountAsync(cancellationToken);

        var page = Math.Max(1, f.Page);
        var size = Math.Clamp(f.PageSize, 1, 100);

        var sort = f.SortBy?.Trim().ToLowerInvariant();
        var ordered = sort switch
        {
            "price_asc" => query.OrderBy(p => p.Price).ThenBy(p => p.ProductId),
            "price_desc" => query.OrderByDescending(p => p.Price).ThenBy(p => p.ProductId),
            "stock" => query.OrderByDescending(p => p.Stock).ThenBy(p => p.ProductId),
            _ => query.OrderBy(p => p.Name).ThenBy(p => p.ProductId),
        };

        var items = await ordered
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync(cancellationToken);

        return (items, total);
    }
}
