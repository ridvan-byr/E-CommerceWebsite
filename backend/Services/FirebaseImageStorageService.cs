using Google.Apis.Auth.OAuth2;
using Google.Cloud.Storage.V1;
using backend.Options;
using Microsoft.Extensions.Options;

namespace backend.Services;

/// <summary>
/// Ürün görsellerini yerel disk yerine Firebase Cloud Storage (Google Cloud Storage)
/// üzerinde saklar. Yüklenen her dosya, bucket içinde "uploads/products/" altına
/// benzersiz bir isimle kaydedilir ve herkese açık (public-read) erişim verilir.
///
/// Dönen URL biçimi: https://storage.googleapis.com/{bucket}/uploads/products/{dosya}.ext
/// </summary>
public class FirebaseImageStorageService : IImageStorageService
{
    private const long MaxFileSizeBytes = 5 * 1024 * 1024;
    private const string UploadPrefix = "uploads/products";

    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp", ".gif",
    };

    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/webp", "image/gif",
    };

    private readonly StorageClient _storage;
    private readonly UrlSigner _urlSigner;
    private readonly string _bucket;
    private readonly ILogger<FirebaseImageStorageService> _logger;

    public FirebaseImageStorageService(
        IOptions<FirebaseOptions> options,
        ILogger<FirebaseImageStorageService> logger)
    {
        _logger = logger;
        var opt = options.Value;

        if (string.IsNullOrWhiteSpace(opt.StorageBucket))
            throw new InvalidOperationException(
                "Firebase:StorageBucket appsettings'te yapılandırılmamış.");

        _bucket = opt.StorageBucket.Trim();

        // Service account JSON yolunu çözümle (göreli → mutlak)
        var saPath = ResolveServiceAccountPath(opt.ServiceAccountPath);

        // StorageClient.Create() scopes'u otomatik uygular; ek CreateScoped gerekmez.
        var credential = GoogleCredential.FromFile(saPath);

        _storage = StorageClient.Create(credential);
        _urlSigner = UrlSigner.FromCredential(credential);
    }

    public async Task<string> SaveProductImageAsync(
        IFormFile file,
        CancellationToken cancellationToken = default)
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

        var objectName = $"{UploadPrefix}/{Guid.NewGuid():N}{ext.ToLowerInvariant()}";

        await using var stream = file.OpenReadStream();

        await _storage.UploadObjectAsync(
            _bucket,
            objectName,
            file.ContentType,
            stream,
            new UploadObjectOptions { PredefinedAcl = PredefinedObjectAcl.PublicRead },
            cancellationToken: cancellationToken);

        var publicUrl = $"https://storage.googleapis.com/{_bucket}/{objectName}";
        _logger.LogInformation("Görsel Firebase Storage'a yüklendi: {Url}", publicUrl);
        return publicUrl;
    }

    public async Task DeleteIfLocalAsync(
        string? imageUrl,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
            return;

        // Yalnızca bu bucket'a ait URL'leri sil
        var prefix = $"https://storage.googleapis.com/{_bucket}/";
        if (!imageUrl.TrimEnd().StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            return;

        var objectName = imageUrl.Trim()[prefix.Length..].Split('?')[0];
        if (string.IsNullOrWhiteSpace(objectName))
            return;

        try
        {
            await _storage.DeleteObjectAsync(_bucket, objectName,
                cancellationToken: cancellationToken);
            _logger.LogInformation("Firebase Storage görseli silindi: {Object}", objectName);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Firebase Storage görseli silinemedi: {Url}", imageUrl);
        }
    }

    private static string ResolveServiceAccountPath(string configured)
    {
        if (Path.IsPathRooted(configured))
            return configured;

        var fromCwd = Path.Combine(Directory.GetCurrentDirectory(), configured);
        if (File.Exists(fromCwd))
            return fromCwd;

        // bin klasöründen çalışıyorsa proje köküne tır
        var fromBase = Path.Combine(AppContext.BaseDirectory, configured);
        return fromBase;
    }
}
