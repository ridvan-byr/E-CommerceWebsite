using backend.DTOs;

namespace backend.Services;

public interface IAuthService
{
    Task<AuthResponseDto?> RegisterAsync(RegisterRequestDto dto, CancellationToken cancellationToken = default);

    Task<AuthResponseDto?> LoginAsync(LoginRequestDto dto, CancellationToken cancellationToken = default);

    Task<UserProfileDto?> GetProfileAsync(int userId, CancellationToken cancellationToken = default);

    Task<string?> GeneratePasswordResetTokenAsync(string email, CancellationToken cancellationToken = default);

    /// <summary>
    /// Sıfırlama token'ı üretir ve kullanıcıya e-posta ile bağlantı gönderir.
    /// Kullanıcı bulunmazsa ya da pasifse hiçbir işlem yapmaz (kullanıcı sayımını açığa çıkarmamak için).
    /// </summary>
    Task SendPasswordResetEmailAsync(string email, CancellationToken cancellationToken = default);

    Task<bool> ResetPasswordAsync(string token, string newPassword, CancellationToken cancellationToken = default);
}
