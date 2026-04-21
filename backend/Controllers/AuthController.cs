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

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto, CancellationToken cancellationToken = default)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _authService.RegisterAsync(dto, cancellationToken);
        if (result is null)
            return Conflict(new { message = "Bu e-posta ile kayıtlı bir kullanıcı var." });

        return Ok(result);
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
    /// </summary>
    [HttpPost("firebase-login")]
    public async Task<IActionResult> FirebaseLogin(
        [FromBody] FirebaseLoginRequestDto dto,
        CancellationToken cancellationToken = default)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _authService.LoginWithFirebaseAsync(dto.IdToken, cancellationToken);
        if (result is null)
            return Unauthorized(new { message = "Firebase kimlik doğrulaması başarısız." });

        return Ok(result);
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto dto, CancellationToken cancellationToken = default)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Kullanıcı enumeration'ını önlemek için her zaman aynı yanıtı döndürüyoruz.
        // E-posta gönderimi servis içinde yapılır; kullanıcı yoksa sessizce çıkar.
        await _authService.SendPasswordResetEmailAsync(dto.Email, cancellationToken);
        return Ok(new { message = "Eğer bu e-posta kayıtlıysa, şifre sıfırlama bağlantısı gönderildi." });
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
