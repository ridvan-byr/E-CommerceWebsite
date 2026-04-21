namespace backend.Options;

public class AppUrlOptions
{
    public const string SectionName = "AppUrl";

    /// <summary>
    /// Frontend'in erişilebildiği base URL (örn. "http://localhost:3000").
    /// E-posta bağlantıları bu değer baz alınarak üretilir.
    /// </summary>
    public string FrontendBaseUrl { get; set; } = "http://localhost:3000";
}
