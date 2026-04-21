using System.Collections.Generic;
using System.Linq;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class UserRepository : IUserRepository
{
    private readonly DataContext _context;

    public UserRepository(DataContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.UserId == userId, cancellationToken);
    }

    public async Task<User?> GetByIdTrackingAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.UserId == userId, cancellationToken);
    }

    public async Task<IReadOnlyDictionary<int, User>> GetByIdsAsync(
        IReadOnlyList<int> userIds,
        CancellationToken cancellationToken = default)
    {
        if (userIds == null || userIds.Count == 0)
            return new Dictionary<int, User>();

        var ids = userIds.Distinct().ToList();
        var rows = await _context.Users
            .AsNoTracking()
            .Where(u => ids.Contains(u.UserId))
            .ToListAsync(cancellationToken);

        return rows.ToDictionary(u => u.UserId);
    }

    public async Task<IReadOnlyDictionary<string, User>> GetByEmailsAsync(
        IReadOnlyList<string> normalizedEmails,
        CancellationToken cancellationToken = default)
    {
        if (normalizedEmails == null || normalizedEmails.Count == 0)
            return new Dictionary<string, User>(StringComparer.OrdinalIgnoreCase);

        var emails = normalizedEmails
            .Select(e => e.Trim().ToLowerInvariant())
            .Where(e => e.Length > 0)
            .Distinct()
            .ToList();
        if (emails.Count == 0)
            return new Dictionary<string, User>(StringComparer.OrdinalIgnoreCase);

        var rows = await _context.Users
            .AsNoTracking()
            .Where(u => emails.Contains(u.Email))
            .ToListAsync(cancellationToken);

        return rows.ToDictionary(u => u.Email, StringComparer.OrdinalIgnoreCase);
    }

    public async Task<User?> GetByEmailAsync(string normalizedEmail, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == normalizedEmail, cancellationToken);
    }

    public async Task<User?> GetByFirebaseUidAsync(string firebaseUid, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid, cancellationToken);
    }

    public async Task<User?> GetByFirebaseUidTrackingAsync(string firebaseUid, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid, cancellationToken);
    }

    public Task<bool> EmailExistsAsync(string normalizedEmail, CancellationToken cancellationToken = default)
    {
        return _context.Users.AnyAsync(u => u.Email == normalizedEmail, cancellationToken);
    }

    public Task<bool> AnyAsync(CancellationToken cancellationToken = default)
    {
        return _context.Users.AnyAsync(cancellationToken);
    }

    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        await _context.Users.AddAsync(user, cancellationToken);
    }

    public async Task<User?> GetByEmailTrackingAsync(string normalizedEmail, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email == normalizedEmail, cancellationToken);
    }

    public async Task<User?> GetByResetTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.PasswordResetToken == token, cancellationToken);
    }

    public async Task<User?> GetByVerificationTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.EmailVerificationToken == token, cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        _context.SaveChangesAsync(cancellationToken);
}
