using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace backend.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger,
        IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Beklenmeyen hata: {Path}", context.Request.Path);
            await WriteProblemDetails(context, ex);
        }
    }

    private async Task WriteProblemDetails(HttpContext context, Exception ex)
    {
        var (status, title) = MapException(ex);

        var problem = new ProblemDetails
        {
            Status = status,
            Title = title,
            Type = $"https://httpstatuses.io/{status}",
            Detail = _env.IsDevelopment() ? ex.ToString() : null,
            Instance = context.Request.Path,
        };

        context.Response.Clear();
        context.Response.StatusCode = status;
        context.Response.ContentType = "application/problem+json";

        var json = JsonSerializer.Serialize(problem, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        });
        await context.Response.WriteAsync(json);
    }

    private static (int Status, string Title) MapException(Exception ex) => ex switch
    {
        UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, "Yetkisiz erişim."),
        KeyNotFoundException => (StatusCodes.Status404NotFound, "Kayıt bulunamadı."),
        ArgumentException => (StatusCodes.Status400BadRequest, "Geçersiz istek."),
        InvalidOperationException => (StatusCodes.Status409Conflict, "İşlem gerçekleştirilemedi."),
        _ => (StatusCodes.Status500InternalServerError, "Sunucu hatası."),
    };
}
