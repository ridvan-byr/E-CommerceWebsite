namespace backend.DTOs;

/// <summary>JWT, HttpOnly cookie ile iletilir; JSON gövdesinde access token dönülmez.</summary>
public class SessionResponseDto
{
    public DateTime ExpiresAtUtc { get; set; }
    public UserProfileDto User { get; set; } = null!;
}
