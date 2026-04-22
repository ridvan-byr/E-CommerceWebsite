using backend.Helpers;
using backend.Models;
using backend.Options;
using backend.Repositories;
using Microsoft.Extensions.Options;

namespace backend.Services;

public class PasswordResetService : IPasswordResetService
{
    private readonly IUserRepository _userRepository;
    private readonly AppUrlOptions _appUrl;
    private readonly IEmailSender _emailSender;
    private readonly IEmailTemplateService _emailTemplateService;
    private readonly ILogger<PasswordResetService> _logger;

    public PasswordResetService(
        IUserRepository userRepository,
        IOptions<AppUrlOptions> appUrlOptions,
        IEmailSender emailSender,
        IEmailTemplateService emailTemplateService,
        ILogger<PasswordResetService> logger)
    {
        _userRepository = userRepository;
        _appUrl = appUrlOptions.Value;
        _emailSender = emailSender;
        _emailTemplateService = emailTemplateService;
        _logger = logger;
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
            _logger.LogInformation(
                "Şifre sıfırlama isteği: kullanıcı bulunamadı/pasif ({Email})", normalized);
            return;
        }

        if (user.PasswordHash == "FIREBASE")
        {
            _logger.LogInformation(
                "Şifre sıfırlama isteği: Firebase OAuth hesabı, işlem atlandı ({Email})", normalized);
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

        var (subject, html, text) = _emailTemplateService.BuildPasswordResetMessage(displayName, resetUrl);

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

    public async Task<ResetTokenStatus> ValidateResetTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByResetTokenAsync(token, cancellationToken);
        if (user is null)
            return ResetTokenStatus.NotFound;

        if (user.PasswordResetTokenExpiry is null || user.PasswordResetTokenExpiry < DateTime.UtcNow)
            return ResetTokenStatus.Expired;

        return ResetTokenStatus.Valid;
    }

    public async Task<bool> ResetPasswordAsync(string token, string newPassword, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByResetTokenAsync(token, cancellationToken);
        if (user is null)
            return false;

        if (user.PasswordResetTokenExpiry is null || user.PasswordResetTokenExpiry < DateTime.UtcNow)
            return false;

        if (user.PasswordHash == "FIREBASE")
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
