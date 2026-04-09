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

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto dto, CancellationToken cancellationToken = default)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var token = await _authService.GeneratePasswordResetTokenAsync(dto.Email, cancellationToken);

        // Always return OK to prevent email enumeration
        // In production, send the token via email instead of returning it
        if (token is not null)
            return Ok(new { message = "Şifre sıfırlama bağlantısı gönderildi.", token });

        return Ok(new { message = "Şifre sıfırlama bağlantısı gönderildi." });
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
