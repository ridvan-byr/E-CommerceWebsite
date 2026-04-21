using System.Security.Claims;
using backend.Helpers;
using backend.Repositories;
using Microsoft.AspNetCore.Http;

namespace backend.Services;

public class CurrentUserAccessor : ICurrentUserAccessor
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IUserRepository _userRepository;
    private string? _cachedActorName;

    public CurrentUserAccessor(IHttpContextAccessor httpContextAccessor, IUserRepository userRepository)
    {
        _httpContextAccessor = httpContextAccessor;
        _userRepository = userRepository;
    }

    public int? UserId
    {
        get
        {
            var user = _httpContextAccessor.HttpContext?.User;
            if (user?.Identity?.IsAuthenticated != true)
                return null;
            var id = user.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(id, out var n) ? n : null;
        }
    }

    public async Task<string> GetActorNameAsync(CancellationToken cancellationToken = default)
    {
        if (_cachedActorName != null)
            return _cachedActorName;

        var principal = _httpContextAccessor.HttpContext?.User;
        if (principal?.Identity?.IsAuthenticated != true)
        {
            _cachedActorName = "System";
            return _cachedActorName;
        }

        var uid = UserId;
        if (uid is int id)
        {
            var row = await _userRepository.GetByIdAsync(id, cancellationToken);
            if (row != null)
            {
                _cachedActorName = UserDisplay.FullName(row);
                return _cachedActorName;
            }
        }

        _cachedActorName = "System";
        return _cachedActorName;
    }
}
