using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Models;
using backend.Options;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services;

public sealed record JwtAccessTokenResult(string AccessToken, DateTime ExpiresAtUtc);

/// <summary>
/// Yerel kullanıcı için JWT access token üretir (AuthService dışında tekrar kullanılmaz).
/// </summary>
public interface IJwtAccessTokenFactory
{
    JwtAccessTokenResult CreateForUser(User user);
}

public sealed class JwtAccessTokenFactory : IJwtAccessTokenFactory
{
    private readonly JwtOptions _jwt;

    public JwtAccessTokenFactory(IOptions<JwtOptions> jwtOptions)
    {
        _jwt = jwtOptions.Value;
    }

    public JwtAccessTokenResult CreateForUser(User user)
    {
        var expiresAtUtc = DateTime.UtcNow.AddMinutes(_jwt.AccessTokenMinutes);
        var token = CreateJwtToken(user, expiresAtUtc);
        return new JwtAccessTokenResult(token, expiresAtUtc);
    }

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
}
