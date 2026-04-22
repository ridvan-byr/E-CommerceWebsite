using backend.Options;
using Microsoft.AspNetCore.Http;

namespace backend.Auth;

public static class AuthCookieExtensions
{
    public const string AccessTokenName = "access_token";

    public static void AppendAccessTokenCookie(
        this HttpResponse response,
        string token,
        JwtOptions jwt,
        IWebHostEnvironment env)
    {
        response.Cookies.Append(AccessTokenName, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = !env.IsDevelopment(),
            SameSite = SameSiteMode.Lax,
            MaxAge = TimeSpan.FromMinutes(jwt.AccessTokenMinutes),
            Path = "/",
        });
    }

    public static void DeleteAccessTokenCookie(this HttpResponse response)
    {
        response.Cookies.Delete(AccessTokenName, new CookieOptions { Path = "/" });
    }
}
