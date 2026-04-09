using backend.DTOs;

namespace backend.Services;

public interface IAuthService
{
    Task<AuthResponseDto?> RegisterAsync(RegisterRequestDto dto, CancellationToken cancellationToken = default);

    Task<AuthResponseDto?> LoginAsync(LoginRequestDto dto, CancellationToken cancellationToken = default);

    Task<UserProfileDto?> GetProfileAsync(int userId, CancellationToken cancellationToken = default);

    Task<string?> GeneratePasswordResetTokenAsync(string email, CancellationToken cancellationToken = default);

    Task<bool> ResetPasswordAsync(string token, string newPassword, CancellationToken cancellationToken = default);
}
