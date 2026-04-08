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

    public AuthService(IUserRepository userRepository, IOptions<JwtOptions> jwtOptions)
    {
        _userRepository = userRepository;
        _jwt = jwtOptions.Value;
    }

    public async Task<AuthResponseDto?> RegisterAsync(RegisterRequestDto dto, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(dto.Email);
        if (await _userRepository.EmailExistsAsync(email, cancellationToken))
            return null;

        var user = new User
        {
            Name = dto.Name.Trim(),
            Surname = dto.Surname.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = "Customer",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
        };

        await _userRepository.AddAsync(user, cancellationToken);
        await _userRepository.SaveChangesAsync(cancellationToken);

        var created = await _userRepository.GetByEmailAsync(email, cancellationToken);
        if (created is null)
            return null;

        return BuildAuthResponse(created);
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginRequestDto dto, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(dto.Email);
        var user = await _userRepository.GetByEmailAsync(email, cancellationToken);
        if (user is null || !user.IsActive)
            return null;

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return null;

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

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
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

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();
}
