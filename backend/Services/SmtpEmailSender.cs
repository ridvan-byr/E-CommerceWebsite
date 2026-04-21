using System.Net;
using System.Net.Mail;
using backend.Options;
using Microsoft.Extensions.Options;

namespace backend.Services;

public class SmtpEmailSender : IEmailSender
{
    private readonly EmailOptions _options;
    private readonly ILogger<SmtpEmailSender> _logger;

    public SmtpEmailSender(IOptions<EmailOptions> options, ILogger<SmtpEmailSender> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task SendAsync(
        string toAddress,
        string toName,
        string subject,
        string htmlBody,
        string? textBody = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(toAddress))
            throw new ArgumentException("Alıcı adresi boş olamaz.", nameof(toAddress));

        using var message = new MailMessage
        {
            From = new MailAddress(_options.FromAddress, _options.FromName),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true,
            BodyEncoding = System.Text.Encoding.UTF8,
            SubjectEncoding = System.Text.Encoding.UTF8,
        };
        message.To.Add(new MailAddress(toAddress, toName));

        if (!string.IsNullOrWhiteSpace(textBody))
        {
            var plainView = AlternateView.CreateAlternateViewFromString(
                textBody, System.Text.Encoding.UTF8, "text/plain");
            var htmlView = AlternateView.CreateAlternateViewFromString(
                htmlBody, System.Text.Encoding.UTF8, "text/html");
            message.AlternateViews.Add(plainView);
            message.AlternateViews.Add(htmlView);
        }

        // Geliştirme ortamı: SMTP sunucusuna bağlanmak yerine .eml dosyası olarak yaz.
        if (!string.IsNullOrWhiteSpace(_options.PickupDirectory))
        {
            var dir = Path.GetFullPath(_options.PickupDirectory);
            Directory.CreateDirectory(dir);

#pragma warning disable SYSLIB0014 // SmtpClient pickup modu alternatifsiz
            using var pickupClient = new SmtpClient
            {
                DeliveryMethod = SmtpDeliveryMethod.SpecifiedPickupDirectory,
                PickupDirectoryLocation = dir,
            };
            await pickupClient.SendMailAsync(message, cancellationToken);
#pragma warning restore SYSLIB0014

            _logger.LogInformation(
                "E-posta pickup klasörüne yazıldı ({Dir}). Alıcı: {To}, konu: {Subject}",
                dir, toAddress, subject);
            return;
        }

        if (string.IsNullOrWhiteSpace(_options.Host))
        {
            _logger.LogWarning(
                "E-posta gönderilemedi: Email:Host ve Email:PickupDirectory tanımsız. Alıcı: {To}",
                toAddress);
            throw new InvalidOperationException(
                "E-posta ayarları eksik: 'Email:Host' veya 'Email:PickupDirectory' yapılandırılmalı.");
        }

#pragma warning disable SYSLIB0014 // SmtpClient yerine MailKit önerilir ancak bağımlılık eklemiyoruz
        using var smtp = new SmtpClient(_options.Host, _options.Port)
        {
            EnableSsl = _options.EnableSsl,
            DeliveryMethod = SmtpDeliveryMethod.Network,
        };

        if (!string.IsNullOrWhiteSpace(_options.Username))
        {
            smtp.UseDefaultCredentials = false;
            smtp.Credentials = new NetworkCredential(_options.Username, _options.Password ?? string.Empty);
        }

        await smtp.SendMailAsync(message, cancellationToken);
#pragma warning restore SYSLIB0014

        _logger.LogInformation(
            "E-posta SMTP üzerinden gönderildi. Alıcı: {To}, konu: {Subject}", toAddress, subject);
    }
}
