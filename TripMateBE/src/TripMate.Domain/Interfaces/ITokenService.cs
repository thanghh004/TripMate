using System.Security.Claims;
using TripMate.Domain.Entities;

namespace TripMate.Domain.Interfaces;

/// <summary>
/// Giao diện dịch vụ quản lý mã JWT và Refresh Token
/// </summary>
public interface ITokenService
{
    /// <summary>
    /// Sinh mã Access Token JWT từ thông tin User
    /// </summary>
    string GenerateAccessToken(User user);

    /// <summary>
    /// Sinh chuỗi mã ngẫu nhiên bảo mật làm Refresh Token
    /// </summary>
    string GenerateRefreshToken();

    /// <summary>
    /// Giải mã một Access Token đã hết hạn để lấy lại danh sách Claims của User
    /// </summary>
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}
