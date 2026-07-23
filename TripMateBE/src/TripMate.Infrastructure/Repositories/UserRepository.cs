using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TripMate.Domain.Entities;
using TripMate.Domain.Interfaces;

namespace TripMate.Infrastructure.Repositories;

/// <summary>
/// Thực thi IUserRepository ở lớp Infrastructure sử dụng UserManager và EF Core
/// </summary>
public class UserRepository : IUserRepository
{
    private readonly UserManager<User> _userManager;

    public UserRepository(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken)
    {
        return await _userManager.Users
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public async Task<User?> GetByPhoneAsync(string phone, CancellationToken cancellationToken)
    {
        return await _userManager.Users
            .FirstOrDefaultAsync(u => u.PhoneNumber == phone, cancellationToken);
    }

    public async Task<IdentityResult> CreateAsync(User user, string password)
    {
        return await _userManager.CreateAsync(user, password);
    }

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _userManager.Users
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }

    public async Task<bool> CheckPasswordAsync(User user, string password)
    {
        return await _userManager.CheckPasswordAsync(user, password);
    }

    public async Task<IdentityResult> UpdateAsync(User user)
    {
        return await _userManager.UpdateAsync(user);
    }

    public async Task<IdentityResult> ResetPasswordAsync(User user, string newPassword)
    {
        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        return await _userManager.ResetPasswordAsync(user, token, newPassword);
    }

    public async Task<User?> GetProfileByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _userManager.Users
            .Include(u => u.OrganizedTrips)
            .Include(u => u.JoinedTrips)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }
}
