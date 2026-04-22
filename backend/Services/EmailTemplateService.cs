using System;

namespace backend.Services;

public class EmailTemplateService : IEmailTemplateService
{
    public (string Subject, string Html, string Text) BuildPasswordResetMessage(string displayName, string resetUrl)
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

    public (string Subject, string Html, string Text) BuildVerificationEmailMessage(string displayName, string verifyUrl)
    {
        var subject = "E-posta adresinizi doğrulayın";
        var safeName = System.Net.WebUtility.HtmlEncode(displayName);
        var safeUrl = System.Net.WebUtility.HtmlEncode(verifyUrl);

        var html = $$"""
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
          <!-- outer wrapper -->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
            style="background-color:#f1f5f9;padding:40px 16px;">
            <tr>
              <td align="center" valign="top">

                <!-- card -->
                <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0"
                  style="max-width:560px;width:100%;background-color:#ffffff;border-radius:16px;
                         overflow:hidden;border:1px solid #e2e8f0;">

                  <!-- header -->
                  <tr>
                    <td style="padding:24px 40px;border-bottom:1px solid #e2e8f0;">
                      <span style="font-size:17px;font-weight:700;color:#4f46e5;font-family:Arial,Helvetica,sans-serif;">
                        E-Ticaret Yönetim Paneli
                      </span>
                    </td>
                  </tr>

                  <!-- body -->
                  <tr>
                    <td style="padding:36px 40px 32px 40px;">

                      <!-- icon box (table-based, no flexbox) -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0"
                        style="margin-bottom:24px;">
                        <tr>
                          <td align="center" valign="middle"
                            style="width:60px;height:60px;border-radius:14px;
                                   background-color:#6366f1;text-align:center;
                                   vertical-align:middle;font-size:28px;line-height:60px;">
                            &#9993;
                          </td>
                        </tr>
                      </table>

                      <!-- greeting -->
                      <p style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#0f172a;
                                font-family:Arial,Helvetica,sans-serif;">
                        Merhaba, {{safeName}}!
                      </p>
                      <p style="margin:0 0 28px 0;font-size:15px;color:#64748b;line-height:1.7;
                                font-family:Arial,Helvetica,sans-serif;">
                        Kaydınızı tamamlamak için e-posta adresinizi doğrulamanız gerekiyor.
                        Aşağıdaki düğmeye tıklayarak hesabınızı aktif hale getirin.
                      </p>

                      <!-- button (table-based for Outlook compatibility) -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td align="center" style="border-radius:10px;background-color:#4f46e5;">
                            <a href="{{safeUrl}}"
                              style="display:inline-block;padding:14px 36px;
                                     background-color:#4f46e5;color:#ffffff;
                                     font-size:15px;font-weight:700;font-family:Arial,Helvetica,sans-serif;
                                     text-decoration:none;border-radius:10px;
                                     mso-padding-alt:0;border:none;">
                              E-Posta Adresimi Do&#287;rula
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- note -->
                      <p style="margin:24px 0 0 0;font-size:13px;color:#94a3b8;line-height:1.7;
                                font-family:Arial,Helvetica,sans-serif;">
                        Bu ba&#287;lant&#305; <strong style="color:#64748b;">24 saat</strong> ge&#231;erlidir.
                        E&#287;er bu hesab&#305; siz olu&#351;turmad&#305;ysan&#305;z bu e-postay&#305; g&#246;rmezden gelebilirsiniz.
                      </p>
                    </td>
                  </tr>

                  <!-- footer -->
                  <tr>
                    <td style="padding:20px 40px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
                      <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;
                                font-family:Arial,Helvetica,sans-serif;">
                        &#169; {{DateTime.UtcNow.Year}} E-Ticaret Y&#246;netim Paneli.
                        Ba&#287;lant&#305; &#231;al&#305;&#351;m&#305;yorsa URL'yi taray&#305;c&#305;n&#305;za kopyalay&#305;n:<br/>
                        <a href="{{safeUrl}}"
                          style="color:#6366f1;word-break:break-all;text-decoration:none;">
                          {{safeUrl}}
                        </a>
                      </p>
                    </td>
                  </tr>

                </table>
                <!-- /card -->

              </td>
            </tr>
          </table>
        </body>
        </html>
        """;

        var text = $"""
        Merhaba {displayName},

        Hesabınızı aktif hale getirmek için aşağıdaki bağlantıya tıklayın (24 saat geçerli):

        {verifyUrl}

        Bu hesabı siz oluşturmadıysanız bu e-postayı görmezden gelebilirsiniz.

        E-Ticaret Yönetim Paneli
        """;

        return (subject, html, text);
    }
}
