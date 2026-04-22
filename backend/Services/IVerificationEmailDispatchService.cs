using backend.Models;

namespace backend.Services;

/// <summary>
/// E-posta doğrulama bağlantısı içeren e-postayı gönderir.
/// </summary>
public interface IVerificationEmailDispatchService
{
    Task SendAsync(User user, CancellationToken cancellationToken = default);
}
