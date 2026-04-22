namespace backend.Options;

public class FirebaseOptions
{
    public const string SectionName = "Firebase";

    /// <summary>
    /// Firebase Admin SDK service account JSON dosyasının yolu
    /// (proje köküne göreli veya mutlak). Secrets klasörüne koyulması önerilir.
    /// </summary>
    public string ServiceAccountPath { get; set; } = "Secrets/firebase-service-account.json";
}
