using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using backend.Data;
using backend.Auth;
using backend.Middleware;
using backend.Options;
using backend.Services;
using backend.Repositories;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();
builder.Services.AddDbContext<DataContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserAccessor, CurrentUserAccessor>();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        var json = options.JsonSerializerOptions;
        json.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        json.PropertyNameCaseInsensitive = true;
    });

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
builder.Services.Configure<EmailOptions>(builder.Configuration.GetSection(EmailOptions.SectionName));
builder.Services.Configure<AppUrlOptions>(builder.Configuration.GetSection(AppUrlOptions.SectionName));
builder.Services.Configure<FirebaseOptions>(builder.Configuration.GetSection(FirebaseOptions.SectionName));
builder.Services.Configure<R2Options>(builder.Configuration.GetSection(R2Options.SectionName));

// Firebase Admin SDK — ID token doğrulaması için yalnızca bir kez başlatılır.
if (FirebaseApp.DefaultInstance is null)
{
    var firebaseOptions = builder.Configuration.GetSection(FirebaseOptions.SectionName).Get<FirebaseOptions>()
        ?? new FirebaseOptions();
    var saPath = Path.IsPathRooted(firebaseOptions.ServiceAccountPath)
        ? firebaseOptions.ServiceAccountPath
        : Path.Combine(AppContext.BaseDirectory, firebaseOptions.ServiceAccountPath);
    if (!File.Exists(saPath))
    {
        // AppContext.BaseDirectory bin klasörünü gösterebilir; proje köküne de bakalım.
        saPath = Path.Combine(Directory.GetCurrentDirectory(), firebaseOptions.ServiceAccountPath);
    }
    FirebaseApp.Create(new AppOptions
    {
        Credential = CredentialFactory.FromFile(saPath, JsonCredentialParameters.ServiceAccountCredentialType),
    });
}
var jwt = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
    ?? throw new InvalidOperationException("Jwt ayarları eksik.");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Secret)),
            ValidateIssuer = true,
            ValidIssuer = jwt.Issuer,
            ValidateAudience = true,
            ValidAudience = jwt.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1),
        };
        // Bearer header yoksa JWT'yi HttpOnly access_token cookie'sinden alır.
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (string.IsNullOrEmpty(context.Token) &&
                    context.Request.Cookies.TryGetValue(AuthCookieExtensions.AccessTokenName, out var fromCookie) &&
                    !string.IsNullOrEmpty(fromCookie))
                {
                    context.Token = fromCookie;
                }

                return Task.CompletedTask;
            },
        };
    });
builder.Services.AddAuthorization();

builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IProductPriceRepository, ProductPriceRepository>();
builder.Services.AddScoped<IProductPriceService, ProductPriceService>();
builder.Services.AddScoped<IFeatureRepository, FeatureRepository>();
builder.Services.AddScoped<IFeatureService, FeatureService>();
builder.Services.AddScoped<IProductFeatureRepository, ProductFeatureRepository>();
builder.Services.AddScoped<IProductFeatureService, ProductFeatureService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddSingleton<IFirebaseAuthService, FirebaseAuthService>();
// Şablon + SMTP önce (VerificationEmailDispatchService bunlara bağlı)
builder.Services.AddSingleton<IEmailTemplateService, EmailTemplateService>();
builder.Services.AddSingleton<IEmailSender, SmtpEmailSender>();
RegisterServices.AddJwtAndVerificationEmailServices(builder.Services);
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPasswordResetService, PasswordResetService>();
RegisterServices.AddProductImageStorage(builder);

// REVIEW [A3] Rate limit policy'leri burada tanımlı ama hiçbir endpoint'te
// uygulanmıyor (`grep "EnableRateLimiting"` boş). Yani brute-force koruma
// tasarlanmış, devreye girmemiş. AuthController.Login ve ForgotPassword
// üstüne `[EnableRateLimiting("auth")]` / `[EnableRateLimiting("password-reset")]`
// attribute'larını ekle. Aksi halde saldırgan dakikada binlerce şifre
// deneyebilir; şu an hiçbir engel yok.
//
// Anahtar kelime: "ASP.NET Core 8 rate limiting middleware [EnableRateLimiting]".
//
// Rate limiting — özellikle auth uçları için brute-force koruması
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddPolicy("auth", httpContext =>
    {
        var key = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: key,
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
                AutoReplenishment = true,
            });
    });

    options.AddPolicy("password-reset", httpContext =>
    {
        var key = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: key,
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(15),
                QueueLimit = 0,
                AutoReplenishment = true,
            });
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:3000", "http://127.0.0.1:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Global exception handling — controller'larda try/catch tekrarını ortadan kaldırır
app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseHttpsRedirection();

// Yüklenen görsellerin servis edilmesi için (wwwroot/uploads/...)
app.UseStaticFiles();

app.UseCors("AllowFrontend");

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
