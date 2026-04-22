using backend.Models;
using backend.Options;
using Microsoft.Extensions.Options;

namespace backend.Services;

public sealed class VerificationEmailDispatchService : IVerificationEmailDispatchService
{
    private readonly AppUrlOptions _appUrl;
    private readonly IEmailSender _emailSender;
    private readonly IEmailTemplateService _emailTemplateService;
    private readonly ILogger<VerificationEmailDispatchService> _logger;

    public VerificationEmailDispatchService(
        IOptions<AppUrlOptions> appUrlOptions,
        IEmailSender emailSender,
        IEmailTemplateService emailTemplateService,
        ILogger<VerificationEmailDispatchService> logger)
    {
        _appUrl = appUrlOptions.Value;
        _emailSender = emailSender;
        _emailTemplateService = emailTemplateService;
        _logger = logger;
    }

    public async Task SendAsync(User user, CancellationToken cancellationToken = default)
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
}
