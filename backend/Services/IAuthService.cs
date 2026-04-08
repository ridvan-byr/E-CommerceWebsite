using backend.DTOs;

namespace backend.Services;

public interface IAuthService
{
    Task<AuthResponseDto?> RegisterAsync(RegisterRequestDto dto, CancellationToken cancellationToken = default);

    Task<AuthResponseDto?> LoginAsync(LoginRequestDto dto, CancellationToken cancellationToken = default);

    Task<UserProfileDto?> GetProfileAsync(int userId, CancellationToken cancellationToken = default);
}
