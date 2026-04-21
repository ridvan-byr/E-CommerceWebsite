namespace backend.Services;

public class ImageStorageService : IImageStorageService
{
    private const long MaxFileSizeBytes = 5 * 1024 * 1024;
    private const string UploadsRelative = "uploads/products";

    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp", ".gif",
    };

    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/webp", "image/gif",
    };

    private readonly IWebHostEnvironment _env;
    private readonly ILogger<ImageStorageService> _logger;

    public ImageStorageService(IWebHostEnvironment env, ILogger<ImageStorageService> logger)
    {
        _env = env;
        _logger = logger;
    }

    public async Task<string> SaveProductImageAsync(IFormFile file, CancellationToken cancellationToken = default)
    {
        if (file is null || file.Length == 0)
            throw new ArgumentException("Dosya seçilmedi.");

        if (file.Length > MaxFileSizeBytes)
            throw new ArgumentException("Dosya boyutu 5 MB sınırını aşıyor.");

        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(ext) || !AllowedExtensions.Contains(ext))
            throw new ArgumentException("Sadece JPG, PNG, WEBP veya GIF dosyaları yüklenebilir.");

        if (!AllowedContentTypes.Contains(file.ContentType))
            throw new ArgumentException("Geçersiz içerik türü.");

        var webRoot = GetWebRoot();
        var absoluteDir = Path.Combine(webRoot, UploadsRelative.Replace('/', Path.DirectorySeparatorChar));
        Directory.CreateDirectory(absoluteDir);

        var fileName = $"{Guid.NewGuid():N}{ext.ToLowerInvariant()}";
        var absolutePath = Path.Combine(absoluteDir, fileName);

        await using (var stream = new FileStream(absolutePath, FileMode.CreateNew))
        {
            await file.CopyToAsync(stream, cancellationToken);
        }

        return $"/{UploadsRelative}/{fileName}";
    }

    public Task DeleteIfLocalAsync(string? imageUrl, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
            return Task.CompletedTask;

        var trimmed = imageUrl.Trim();
        if (!trimmed.StartsWith($"/{UploadsRelative}/", StringComparison.OrdinalIgnoreCase))
            return Task.CompletedTask;

        try
        {
            var webRoot = GetWebRoot();
            var relative = trimmed.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
            var absolute = Path.GetFullPath(Path.Combine(webRoot, relative));
            var uploadsRoot = Path.GetFullPath(
                Path.Combine(webRoot, UploadsRelative.Replace('/', Path.DirectorySeparatorChar)));

            if (!absolute.StartsWith(uploadsRoot + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase))
                return Task.CompletedTask;

            if (File.Exists(absolute))
                File.Delete(absolute);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Görsel silinemedi: {Url}", imageUrl);
        }

        return Task.CompletedTask;
    }

    private string GetWebRoot()
    {
        var root = _env.WebRootPath;
        if (string.IsNullOrWhiteSpace(root))
        {
            root = Path.Combine(_env.ContentRootPath, "wwwroot");
            Directory.CreateDirectory(root);
        }
        return root;
    }
}
