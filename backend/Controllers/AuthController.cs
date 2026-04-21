using System.Security.Claims;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Firebase üzerinden yeni kullanıcı kaydeder.
    /// İstek gövdesi: { idToken, name, surname }.
    /// E-posta doğrulama maili gönderir; henüz JWT üretmez.
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] FirebaseRegisterRequestDto dto, CancellationToken cancellationToken = default)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _authService.RegisterAsync(dto, cancellationToken);
        if (result is null)
            return Conflict(new { message = "Bu e-posta ile kayıtlı bir kullanıcı var ya da kimlik doğrulaması başarısız." });

        return StatusCode(201, result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto, CancellationToken cancellationToken = default)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _authService.LoginAsync(dto, cancellationToken);
        if (result is null)
            return Unauthorized(new { message = "E-posta veya şifre hatalı veya hesap pasif." });

        return Ok(result);
    }

    /// <summary>
    /// Firebase Authentication ID Token ile giriş. Frontend Firebase ile
    /// signIn yaptıktan sonra aldığı ID Token'ı buraya gönderir; backend
    /// doğrular, gerekirse yerel User kaydını oluşturur ve kendi JWT'sini döner.
    /// E-posta doğrulanmamışsa 403 + errorCode: "EMAIL_NOT_VERIFIED" döner.
    /// </summary>
    [HttpPost("firebase-login")]
    public async Task<IActionResult> FirebaseLogin(
        [FromBody] FirebaseLoginRequestDto dto,
        CancellationToken cancellationToken = default)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _authService.LoginWithFirebaseAsync(dto.IdToken, cancellationToken);

        if (result.ErrorCode == "EMAIL_NOT_VERIFIED")
            return StatusCode(403, new
            {
                message = "E-posta adresinizi doğrulamanız gerekiyor. Gelen kutunuzu kontrol edin.",
                errorCode = "EMAIL_NOT_VERIFIED",
                email = result.Email,
            });

        if (result.Response is null)
            return Unauthorized(new { message = "Firebase kimlik doğrulaması başarısız." });

        return Ok(result.Response);
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto dto, CancellationToken cancellationToken = default)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        await _authService.SendPasswordResetEmailAsync(dto.Email, cancellationToken);
        return Ok(new { message = "Eğer bu e-posta kayıtlıysa, şifre sıfırlama bağlantısı gönderildi." });
    }

    [HttpGet("validate-reset-token")]
    public async Task<IActionResult> ValidateResetToken([FromQuery] string token, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(token))
            return BadRequest(new { status = "invalid" });

        var status = await _authService.ValidateResetTokenAsync(token, cancellationToken);
        return Ok(new
        {
            status = status switch
            {
                ResetTokenStatus.Valid => "valid",
                ResetTokenStatus.Expired => "expired",
                _ => "invalid",
            },
        });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto dto, CancellationToken cancellationToken = default)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var success = await _authService.ResetPasswordAsync(dto.Token, dto.NewPassword, cancellationToken);
        if (!success)
            return BadRequest(new { message = "Geçersiz veya süresi dolmuş token." });

        return Ok(new { message = "Şifreniz başarıyla güncellendi." });
    }

    /// <summary>Doğrulama bağlantısından gelen token'ı işler.</summary>
    [HttpGet("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromQuery] string token, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(token))
            return BadRequest(new { status = "invalid" });

        var status = await _authService.VerifyEmailAsync(token, cancellationToken);
        return Ok(new
        {
            status = status switch
            {
                VerifyEmailStatus.Success => "success",
                VerifyEmailStatus.AlreadyVerified => "already_verified",
                VerifyEmailStatus.Expired => "expired",
                _ => "invalid",
            },
        });
    }

    /// <summary>Doğrulama e-postasını yeniden gönderir.</summary>
    [HttpPost("resend-verification")]
    public async Task<IActionResult> ResendVerification([FromBody] ForgotPasswordRequestDto dto, CancellationToken cancellationToken = default)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        await _authService.ResendVerificationEmailAsync(dto.Email, cancellationToken);
        return Ok(new { message = "Eğer bu e-posta doğrulanmamış bir hesaba aitse, doğrulama bağlantısı gönderildi." });
    }

    /// <summary>
    /// Oturum açmış kullanıcının KVKK onayını kaydeder.
    /// Google ile ilk kez giriş yapan kullanıcılar bu endpoint'i çağırır.
    /// </summary>
    [Authorize]
    [HttpPost("accept-consent")]
    public async Task<IActionResult> AcceptConsent(CancellationToken cancellationToken = default)
    {
        var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(idStr) || !int.TryParse(idStr, out var userId))
            return Unauthorized();

        var success = await _authService.AcceptKvkkAsync(userId, cancellationToken);
        if (!success)
            return NotFound(new { message = "Kullanıcı bulunamadı." });

        return Ok(new { message = "KVKK onayı kaydedildi." });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me(CancellationToken cancellationToken = default)
    {
        var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(idStr) || !int.TryParse(idStr, out var userId))
            return Unauthorized();

        var profile = await _authService.GetProfileAsync(userId, cancellationToken);
        if (profile is null)
            return NotFound();

        return Ok(profile);
    }
}
