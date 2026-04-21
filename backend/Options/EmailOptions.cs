namespace backend.Options;

public class EmailOptions
{
    public const string SectionName = "Email";

    public string FromAddress { get; set; } = "no-reply@ecommerce.local";
    public string FromName { get; set; } = "E-Ticaret";

    public string Host { get; set; } = string.Empty;
    public int Port { get; set; } = 587;
    public bool EnableSsl { get; set; } = true;
    public string? Username { get; set; }
    public string? Password { get; set; }

    /// <summary>
    /// Geliştirme ortamı için: dolu bırakılırsa SMTP sunucusuna bağlanmak yerine
    /// e-postalar bu klasöre .eml dosyası olarak yazılır (herhangi bir e-posta
    /// istemcisi ile açılabilir).
    /// </summary>
    public string? PickupDirectory { get; set; }
}
