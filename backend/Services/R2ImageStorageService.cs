using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using backend.Options;
using Microsoft.Extensions.Options;

namespace backend.Services;

/// <summary>
/// Ürün görsellerini Cloudflare R2 (S3 uyumlu API) üzerinde saklar.
/// Cloudflare: R2, AWSSDK.S3 streaming SigV4 gövde imzasını desteklemez;
/// PutObject için <see cref="PutObjectRequest.DisablePayloadSigning"/> ve
/// <see cref="PutObjectRequest.DisableDefaultChecksumValidation"/> zorunludur.
/// https://developers.cloudflare.com/r2/examples/aws/aws-sdk-net/
/// </summary>
public sealed class R2ImageStorageService : IImageStorageService, IDisposable
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

    private readonly AmazonS3Client _s3;
    private readonly string _bucket;
    private readonly string _publicBase;
    private readonly ILogger<R2ImageStorageService> _logger;

    public R2ImageStorageService(IOptions<R2Options> options, ILogger<R2ImageStorageService> logger)
    {
        _logger = logger;
        var opt = options.Value ?? throw new InvalidOperationException("R2 yapılandırması eksik.");

        if (string.IsNullOrWhiteSpace(opt.AccountId)
            || string.IsNullOrWhiteSpace(opt.AccessKeyId)
            || string.IsNullOrWhiteSpace(opt.SecretAccessKey)
            || string.IsNullOrWhiteSpace(opt.BucketName)
            || string.IsNullOrWhiteSpace(opt.PublicBaseUrl))
        {
            throw new InvalidOperationException(
                "R2 ayarları eksik: AccountId, AccessKeyId, SecretAccessKey, BucketName, PublicBaseUrl " +
                "appsettings veya user-secrets içinde doldurulmalıdır.");
        }

        _bucket = opt.BucketName.Trim();
        _publicBase = opt.PublicBaseUrl.Trim().TrimEnd('/');
        var accountId = opt.AccountId.Trim();

        var cfg = new AmazonS3Config
        {
            ServiceURL = $"https://{accountId}.r2.cloudflarestorage.com",
            ForcePathStyle = true,
        };

        _s3 = new AmazonS3Client(
            new BasicAWSCredentials(opt.AccessKeyId.Trim(), opt.SecretAccessKey.Trim()),
            cfg);
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

        var fileName = $"{Guid.NewGuid():N}{ext.ToLowerInvariant()}";
        var objectKey = $"{UploadPrefix}/{fileName}";

        try
        {
            await using var stream = file.OpenReadStream();
            var req = new PutObjectRequest
            {
                BucketName = _bucket,
                Key = objectKey,
                InputStream = stream,
                ContentType = file.ContentType,
                AutoCloseStream = false,
                DisablePayloadSigning = true,
                DisableDefaultChecksumValidation = true,
            };
            await _s3.PutObjectAsync(req, cancellationToken);
        }
        catch (AmazonS3Exception ex)
        {
            _logger.LogWarning(ex, "R2 PutObject başarısız: {Key}", objectKey);
            throw new ArgumentException(
                $"R2 yükleme hatası ({ex.StatusCode}): {ex.Message}. Bucket, API anahtarı ve token izinlerini kontrol edin.",
                ex);
        }

        var publicUrl = $"{_publicBase}/{objectKey}";
        _logger.LogInformation("Görsel R2'ye yüklendi: {Url}", publicUrl);
        return publicUrl;
    }

    public async Task DeleteIfLocalAsync(string? imageUrl, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
            return;

        var trimmed = imageUrl.Trim();
        var prefix = $"{_publicBase}/";
        if (!trimmed.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            return;

        var key = trimmed[prefix.Length..].Split('?')[0];
        if (string.IsNullOrWhiteSpace(key))
            return;

        try
        {
            await _s3.DeleteObjectAsync(_bucket, key, cancellationToken);
            _logger.LogInformation("R2 görseli silindi: {Key}", key);
        }
        catch (AmazonS3Exception ex)
        {
            _logger.LogWarning(ex, "R2 görseli silinemedi: {Key}", key);
        }
    }

    public void Dispose() => _s3.Dispose();
}
