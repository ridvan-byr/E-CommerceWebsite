using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.DTOs;
using backend.Models;
using backend.Options;
using backend.Repositories;
using FirebaseAdmin.Auth;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IFirebaseAuthService _firebaseAuth;
    private readonly JwtOptions _jwt;
    private readonly AppUrlOptions _appUrl;
    private readonly IEmailSender _emailSender;
    private readonly IEmailTemplateService _emailTemplateService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepository,
        IFirebaseAuthService firebaseAuth,
        IOptions<JwtOptions> jwtOptions,
        IOptions<AppUrlOptions> appUrlOptions,
        IEmailSender emailSender,
        IEmailTemplateService emailTemplateService,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _firebaseAuth = firebaseAuth;
        _jwt = jwtOptions.Value;
        _appUrl = appUrlOptions.Value;
        _emailSender = emailSender;
        _emailTemplateService = emailTemplateService;
        _logger = logger;
    }

    public async Task<RegisterResultDto?> RegisterAsync(FirebaseRegisterRequestDto dto, CancellationToken cancellationToken = default)
    {
        // Firebase token'ını doğrula, e-postayı oradan al.
        FirebaseToken decoded;
        try
        {
            decoded = await _firebaseAuth.VerifyIdTokenAsync(dto.IdToken, cancellationToken);
        }
        catch (FirebaseAuthException ex)
        {
            _logger.LogWarning(ex, "Kayıt: Firebase ID Token doğrulanamadı.");
            return null;
        }

        var claims = decoded.Claims;
        var email = claims.TryGetValue("email", out var e) && e is string es
            ? NormalizeEmail(es) : null;

        if (email is null)
        {
            _logger.LogWarning("Kayıt: Firebase token e-posta içermiyor (uid={Uid})", decoded.Uid);
            return null;
        }

        if (await _userRepository.EmailExistsAsync(email, cancellationToken))
            return null; // null → 409 Conflict

        var role = (await _userRepository.AnyAsync(cancellationToken)) ? "Customer" : "Admin";
        var verificationToken = Guid.NewGuid().ToString("N");

        var user = new User
        {
            Name = dto.Name.Trim(),
            Surname = dto.Surname.Trim(),
            Email = email,
            FirebaseUid = decoded.Uid,
            PasswordHash = "FIREBASE",
            Role = role,
            IsActive = true,
            EmailVerified = false,
            EmailVerificationToken = verificationToken,
            EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24),
            // Kayıt formunda KVKK checkbox'ı onaylanarak gelindiği için burada kabul edilmiş sayılır.
            KvkkAcceptedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
        };

        await _userRepository.AddAsync(user, cancellationToken);
        await _userRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Yeni kullanıcı kaydedildi (doğrulama bekleniyor): {Email} (rol: {Role})", email, role);

        await SendVerificationEmailInternalAsync(user, cancellationToken);

        return new RegisterResultDto { Email = email };
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

    public async Task<AuthResult> LoginWithFirebaseAsync(string idToken, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(idToken))
            return new AuthResult(null);

        FirebaseToken decoded;
        try
        {
            decoded = await _firebaseAuth.VerifyIdTokenAsync(idToken, cancellationToken);
        }
        catch (FirebaseAuthException ex)
        {
            _logger.LogWarning(ex, "Firebase ID Token doğrulanamadı.");
            return new AuthResult(null);
        }

        var uid = decoded.Uid;
        var claims = decoded.Claims;

        var email = claims.TryGetValue("email", out var e) && e is string es
            ? NormalizeEmail(es)
            : null;
        var displayName = claims.TryGetValue("name", out var n) && n is string ns ? ns : null;
        var photoUrl = claims.TryGetValue("picture", out var p) && p is string ps && ps.Length > 0
            ? ps
            : null;

        var user = await _userRepository.GetByFirebaseUidTrackingAsync(uid, cancellationToken);

        if (user is null && email is not null)
        {
            // Aynı e-postaya sahip yerel kullanıcı varsa Firebase UID'sini bağla.
            user = await _userRepository.GetByEmailTrackingAsync(email, cancellationToken);
            if (user is not null)
            {
                user.FirebaseUid = uid;
                if (photoUrl is not null) user.PhotoUrl = photoUrl;
                user.UpdatedAt = DateTime.UtcNow;
                await _userRepository.SaveChangesAsync(cancellationToken);
                _logger.LogInformation("Mevcut kullanıcı Firebase UID'ye bağlandı: {Email}", email);
            }
        }

        if (user is null)
        {
            if (email is null)
            {
                _logger.LogWarning("Firebase token e-posta içermiyor, kullanıcı oluşturulamadı: {Uid}", uid);
                return new AuthResult(null);
            }

            var (firstName, lastName) = SplitDisplayName(displayName, email);
            var role = (await _userRepository.AnyAsync(cancellationToken)) ? "Customer" : "Admin";

            user = new User
            {
                Name = firstName,
                Surname = lastName,
                Email = email,
                FirebaseUid = uid,
                PhotoUrl = photoUrl,
                PasswordHash = "FIREBASE",
                Role = role,
                IsActive = true,
                // Google / diğer OAuth provider'lar e-postayı doğrulanmış olarak sunar.
                EmailVerified = true,
                CreatedAt = DateTime.UtcNow,
            };

            await _userRepository.AddAsync(user, cancellationToken);
            await _userRepository.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Firebase ile yeni kullanıcı oluşturuldu: {Email} (rol: {Role})", email, role);
        }
        else if (photoUrl is not null && user.PhotoUrl != photoUrl)
        {
            // Mevcut kullanıcıda fotoğraf güncellendiyse senkronize et.
            user.PhotoUrl = photoUrl;
            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.SaveChangesAsync(cancellationToken);
        }

        if (!user.IsActive)
        {
            _logger.LogWarning("Firebase girişi: pasif hesap {Email}", user.Email);
            return new AuthResult(null);
        }

        // E-posta doğrulanmamışsa giriş engelle.
        if (!user.EmailVerified)
        {
            _logger.LogWarning("Firebase girişi: e-posta doğrulanmamış {Email}", user.Email);
            return new AuthResult(null, "EMAIL_NOT_VERIFIED", user.Email);
        }

        return new AuthResult(BuildAuthResponse(user));
    }

    private static (string First, string Last) SplitDisplayName(string? displayName, string fallbackEmail)
    {
        if (!string.IsNullOrWhiteSpace(displayName))
        {
            var parts = displayName.Trim().Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 2) return (parts[0], parts[1]);
            if (parts.Length == 1) return (parts[0], string.Empty);
        }
        var local = fallbackEmail.Split('@')[0];
        return (local, string.Empty);
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
            PhotoUrl = user.PhotoUrl,
            KvkkAccepted = user.KvkkAcceptedAt.HasValue,
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



    public async Task<VerifyEmailStatus> VerifyEmailAsync(string token, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByVerificationTokenAsync(token, cancellationToken);
        if (user is null)
            return VerifyEmailStatus.NotFound;

        if (user.EmailVerified)
        {
            user.EmailVerificationToken = null;
            user.EmailVerificationTokenExpiry = null;
            await _userRepository.SaveChangesAsync(cancellationToken);
            return VerifyEmailStatus.AlreadyVerified;
        }

        if (user.EmailVerificationTokenExpiry is null || user.EmailVerificationTokenExpiry < DateTime.UtcNow)
            return VerifyEmailStatus.Expired;

        user.EmailVerified = true;
        user.EmailVerificationToken = null;
        user.EmailVerificationTokenExpiry = null;
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("E-posta doğrulandı: {Email}", user.Email);
        return VerifyEmailStatus.Success;
    }

    public async Task ResendVerificationEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var normalized = NormalizeEmail(email);
        var user = await _userRepository.GetByEmailTrackingAsync(normalized, cancellationToken);

        if (user is null || !user.IsActive || user.EmailVerified)
        {
            _logger.LogInformation("Yeniden doğrulama: kullanıcı bulunamadı/pasif/zaten doğrulanmış ({Email})", normalized);
            return;
        }

        var token = Guid.NewGuid().ToString("N");
        user.EmailVerificationToken = token;
        user.EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24);
        await _userRepository.SaveChangesAsync(cancellationToken);

        await SendVerificationEmailInternalAsync(user, cancellationToken);
    }

    private async Task SendVerificationEmailInternalAsync(User user, CancellationToken cancellationToken)
    {
        var baseUrl = (_appUrl.FrontendBaseUrl ?? string.Empty).TrimEnd('/');
        var verifyUrl = $"{baseUrl}/verify-email?token={Uri.EscapeDataString(user.EmailVerificationToken!)}";
        var fullName = $"{user.Name} {user.Surname}".Trim();
        if (fullName.Length == 0) fullName = "Kullanıcı";

        var (subject, html, text) = _emailTemplateService.BuildVerificationEmailMessage(fullName, verifyUrl);

        try
        {
            await _emailSender.SendAsync(user.Email, fullName, subject, html, text, cancellationToken);
            _logger.LogInformation("Doğrulama e-postası gönderildi: {Email}", user.Email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Doğrulama e-postası gönderilemedi: {Email}", user.Email);
            throw;
        }
    }

    public async Task<bool> AcceptKvkkAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdTrackingAsync(userId, cancellationToken);
        if (user is null) return false;

        user.KvkkAcceptedAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("KVKK onayı kaydedildi: {Email} ({UserId})", user.Email, userId);
        return true;
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();
}
