using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.DTOs;
using backend.Models;
using backend.Options;
using backend.Repositories;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly JwtOptions _jwt;
    private readonly AppUrlOptions _appUrl;
    private readonly IEmailSender _emailSender;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepository,
        IOptions<JwtOptions> jwtOptions,
        IOptions<AppUrlOptions> appUrlOptions,
        IEmailSender emailSender,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _jwt = jwtOptions.Value;
        _appUrl = appUrlOptions.Value;
        _emailSender = emailSender;
        _logger = logger;
    }

    public async Task<AuthResponseDto?> RegisterAsync(RegisterRequestDto dto, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(dto.Email);
        if (await _userRepository.EmailExistsAsync(email, cancellationToken))
            return null;

        // İlk kayıt olan kullanıcı otomatik olarak Admin olur; sonrakiler Customer.
        var role = (await _userRepository.AnyAsync(cancellationToken)) ? "Customer" : "Admin";

        var user = new User
        {
            Name = dto.Name.Trim(),
            Surname = dto.Surname.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = role,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
        };

        await _userRepository.AddAsync(user, cancellationToken);
        await _userRepository.SaveChangesAsync(cancellationToken);

        var created = await _userRepository.GetByEmailAsync(email, cancellationToken);
        if (created is null)
            return null;

        _logger.LogInformation("Yeni kullanıcı kaydedildi: {Email} (rol: {Role})", created.Email, created.Role);
        return BuildAuthResponse(created);
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginRequestDto dto, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(dto.Email);
        var user = await _userRepository.GetByEmailAsync(email, cancellationToken);
        if (user is null || !user.IsActive)
        {
            _logger.LogWarning("Başarısız giriş: kullanıcı bulunamadı veya pasif {Email}", email);
            return null;
        }

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            _logger.LogWarning("Başarısız giriş: hatalı şifre {Email}", email);
            return null;
        }

        return BuildAuthResponse(user);
    }

    public async Task<UserProfileDto?> GetProfileAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        return user is null ? null : MapProfile(user);
    }

    private AuthResponseDto BuildAuthResponse(User user)
    {
        var expires = DateTime.UtcNow.AddMinutes(_jwt.AccessTokenMinutes);
        var token = CreateJwtToken(user, expires);
        return new AuthResponseDto
        {
            AccessToken = token,
            ExpiresAtUtc = expires,
            User = MapProfile(user),
        };
    }

    private static UserProfileDto MapProfile(User user) =>
        new()
        {
            UserId = user.UserId,
            Name = user.Name,
            Surname = user.Surname,
            Email = user.Email,
            Role = user.Role,
        };

    private string CreateJwtToken(User user, DateTime expiresUtc)
    {
        var keyBytes = Encoding.UTF8.GetBytes(_jwt.Secret);
        if (keyBytes.Length < 32)
            throw new InvalidOperationException("Jwt:Secret en az 32 karakter olmalıdır (HS256).");

        var nameClaim = $"{user.Name} {user.Surname}".Trim();
        if (nameClaim.Length == 0)
            nameClaim = "Kullanıcı";

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Name, nameClaim),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var creds = new SigningCredentials(
            new SymmetricSecurityKey(keyBytes),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwt.Issuer,
            audience: _jwt.Audience,
            claims: claims,
            expires: expiresUtc,
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<string?> GeneratePasswordResetTokenAsync(string email, CancellationToken cancellationToken = default)
    {
        var normalized = NormalizeEmail(email);
        var user = await _userRepository.GetByEmailTrackingAsync(normalized, cancellationToken);
        if (user is null || !user.IsActive)
            return null;

        var token = Guid.NewGuid().ToString("N");
        user.PasswordResetToken = token;
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);
        await _userRepository.SaveChangesAsync(cancellationToken);

        return token;
    }

    public async Task SendPasswordResetEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var normalized = NormalizeEmail(email);
        var user = await _userRepository.GetByEmailTrackingAsync(normalized, cancellationToken);
        if (user is null || !user.IsActive)
        {
            // Kullanıcı enumeration'ı önlemek için controller her zaman 200 döner;
            // burada sessizce çıkıyoruz.
            _logger.LogInformation(
                "Şifre sıfırlama isteği: kullanıcı bulunamadı/pasif ({Email})", normalized);
            return;
        }

        var token = Guid.NewGuid().ToString("N");
        user.PasswordResetToken = token;
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);
        await _userRepository.SaveChangesAsync(cancellationToken);

        var baseUrl = (_appUrl.FrontendBaseUrl ?? string.Empty).TrimEnd('/');
        var resetUrl = $"{baseUrl}/reset-password?token={Uri.EscapeDataString(token)}";

        var displayName = $"{user.Name} {user.Surname}".Trim();
        if (displayName.Length == 0) displayName = "Kullanıcı";

        var (subject, html, text) = BuildPasswordResetMessage(displayName, resetUrl);

        try
        {
            await _emailSender.SendAsync(user.Email, displayName, subject, html, text, cancellationToken);
            _logger.LogInformation("Şifre sıfırlama e-postası gönderildi: {Email}", user.Email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Şifre sıfırlama e-postası gönderilemedi: {Email}", user.Email);
            throw;
        }
    }

    private static (string Subject, string Html, string Text) BuildPasswordResetMessage(string displayName, string resetUrl)
    {
        var subject = "Şifre sıfırlama talebi";

        var safeName = System.Net.WebUtility.HtmlEncode(displayName);
        var safeUrl = System.Net.WebUtility.HtmlEncode(resetUrl);

        var html = $$"""
        <!DOCTYPE html>
        <html lang="tr">
          <body style="margin:0;padding:0;background:#f1f5f9;font-family:Segoe UI,Arial,sans-serif;color:#0f172a;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:32px 0;">
              <tr>
                <td align="center">
                  <table role="presentation" width="560" cellspacing="0" cellpadding="0"
                    style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.08);">
                    <tr>
                      <td style="padding:32px 40px 24px 40px;border-bottom:1px solid #e2e8f0;">
                        <div style="font-size:18px;font-weight:700;color:#4f46e5;">E-Ticaret Yönetim Paneli</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:32px 40px;">
                        <h1 style="margin:0 0 16px 0;font-size:22px;color:#0f172a;">Merhaba {{safeName}},</h1>
                        <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#334155;">
                          Hesabınız için bir şifre sıfırlama talebi aldık. Aşağıdaki butona tıklayarak yeni bir şifre belirleyebilirsiniz.
                        </p>
                        <p style="margin:24px 0;text-align:center;">
                          <a href="{{safeUrl}}"
                             style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;
                                    padding:12px 24px;border-radius:10px;font-weight:600;font-size:14px;">
                            Şifreyi sıfırla
                          </a>
                        </p>
                        <p style="margin:0 0 8px 0;font-size:13px;color:#64748b;">
                          Buton çalışmıyorsa aşağıdaki bağlantıyı tarayıcınıza yapıştırabilirsiniz:
                        </p>
                        <p style="margin:0 0 16px 0;font-size:12px;color:#4f46e5;word-break:break-all;">
                          <a href="{{safeUrl}}" style="color:#4f46e5;">{{safeUrl}}</a>
                        </p>
                        <p style="margin:24px 0 0 0;font-size:13px;color:#64748b;line-height:1.6;">
                          Bu bağlantı <strong>1 saat</strong> boyunca geçerlidir. Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:20px 40px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;">
                        Bu otomatik bir e-postadır, lütfen yanıtlamayın.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
        """;

        var text = $"""
        Merhaba {displayName},

        Hesabınız için bir şifre sıfırlama talebi aldık. Aşağıdaki bağlantıyı kullanarak yeni bir şifre belirleyebilirsiniz (1 saat geçerli):

        {resetUrl}

        Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.

        E-Ticaret Yönetim Paneli
        """;

        return (subject, html, text);
    }

    public async Task<bool> ResetPasswordAsync(string token, string newPassword, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByResetTokenAsync(token, cancellationToken);
        if (user is null)
            return false;

        if (user.PasswordResetTokenExpiry is null || user.PasswordResetTokenExpiry < DateTime.UtcNow)
            return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiry = null;
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();
}
