namespace backend.Models;

public class User
{
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetTokenExpiry { get; set; }

    /// <summary>
    /// Firebase Authentication UID — kullanıcı Firebase üzerinden giriş yaptığında
    /// yerel User kaydıyla eşleştirme için kullanılır. Eski/sadece e-posta+şifre ile
    /// kayıtlı kullanıcılar için null olabilir.
    /// </summary>
    public string? FirebaseUid { get; set; }

    /// <summary>
    /// Kullanıcı profil fotoğrafı URL'i (Firebase / Google). Yoksa null.
    /// </summary>
    public string? PhotoUrl { get; set; }
}
