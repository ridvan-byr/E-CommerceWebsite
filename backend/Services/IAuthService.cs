using backend.DTOs;

namespace backend.Services;

public enum ResetTokenStatus { Valid, Expired, NotFound }

public enum VerifyEmailStatus { Success, AlreadyVerified, Expired, NotFound }

/// <summary>
/// Firebase üzerinden giriş/kayıt işleminin sonucu.
/// ErrorCode: null → başarılı; "EMAIL_NOT_VERIFIED" → e-posta doğrulanmamış.
/// </summary>
public record AuthResult(AuthResponseDto? Response, string? ErrorCode = null, string? Email = null);

public interface IAuthService
{
    /// <summary>
    /// Firebase ID Token ile yeni kullanıcı kaydeder.
    /// Yerel DB'ye ekler, e-posta doğrulama maili gönderir; henüz JWT üretmez.
    /// E-posta zaten kayıtlıysa null döner.
    /// </summary>
    Task<RegisterResultDto?> RegisterAsync(FirebaseRegisterRequestDto dto, CancellationToken cancellationToken = default);

    Task<AuthResponseDto?> LoginAsync(LoginRequestDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Firebase ID Token ile giriş. Token geçerliyse yerel kullanıcı
    /// kaydı bulunur veya otomatik oluşturulur (Customer rolüyle).
    /// Başarılıysa kendi backend JWT'sini içeren yanıt döner.
    /// E-posta doğrulanmamışsa ErrorCode = "EMAIL_NOT_VERIFIED" döner.
    /// </summary>
    Task<AuthResult> LoginWithFirebaseAsync(string idToken, CancellationToken cancellationToken = default);

    Task<UserProfileDto?> GetProfileAsync(int userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// E-posta doğrulama token'ını doğrular ve hesabı aktif hale getirir.
    /// </summary>
    Task<VerifyEmailStatus> VerifyEmailAsync(string token, CancellationToken cancellationToken = default);

    /// <summary>
    /// Belirtilen e-postaya yeni doğrulama maili gönderir.
    /// Kullanıcı bulunamazsa sessizce çıkar (enumeration önleme).
    /// </summary>
    Task ResendVerificationEmailAsync(string email, CancellationToken cancellationToken = default);

    /// <summary>
    /// Kullanıcının KVKK Aydınlatma Metni'ni okuduğunu ve onayladığını kaydeder.
    /// </summary>
    Task<bool> AcceptKvkkAsync(int userId, CancellationToken cancellationToken = default);
}
