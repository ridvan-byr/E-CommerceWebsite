namespace backend.Services;

public interface IEmailTemplateService
{
    (string Subject, string Html, string Text) BuildPasswordResetMessage(string displayName, string resetUrl);
    (string Subject, string Html, string Text) BuildVerificationEmailMessage(string displayName, string verifyUrl);
}
