namespace backend.Options;

public class R2Options
{
    public const string SectionName = "R2";

    /// <summary>Cloudflare hesap kimliği (R2 S3 API uç noktası için).</summary>
    public string AccountId { get; set; } = string.Empty;

    public string AccessKeyId { get; set; } = string.Empty;

    public string SecretAccessKey { get; set; } = string.Empty;

    public string BucketName { get; set; } = string.Empty;

    /// <summary>
    /// Genel okuma URL öneki: R2 bucket için "Public access" ile verilen <c>https://pub-….r2.dev</c>
    /// veya bağlı özel alan adı (sonunda / olmadan).
    /// </summary>
    public string PublicBaseUrl { get; set; } = string.Empty;
}
