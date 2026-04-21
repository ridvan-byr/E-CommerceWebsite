namespace backend.Services;

public interface IImageStorageService
{
    Task<string> SaveProductImageAsync(IFormFile file, CancellationToken cancellationToken = default);
    Task DeleteIfLocalAsync(string? imageUrl, CancellationToken cancellationToken = default);
}
