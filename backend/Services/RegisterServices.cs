using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace backend.Services;

internal static class RegisterServices
{
    internal static void AddProductImageStorage(WebApplicationBuilder builder) =>
        builder.Services.AddSingleton<IImageStorageService, R2ImageStorageService>();

    /// <summary>JWT üretimi ve doğrulama e-postası gönderimi (Program.cs'te tip çözümlemesi için burada toplanır).</summary>
    internal static void AddJwtAndVerificationEmailServices(IServiceCollection services)
    {
        services.AddSingleton<IJwtAccessTokenFactory, JwtAccessTokenFactory>();
        services.AddSingleton<IVerificationEmailDispatchService, VerificationEmailDispatchService>();
    }
}
