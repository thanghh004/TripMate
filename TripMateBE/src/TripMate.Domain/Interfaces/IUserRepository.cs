using Microsoft.AspNetCore.Identity;
using TripMate.Domain.Entities;

namespace TripMate.Domain.Interfaces;

/// <summary>
/// Giao diện quản lý người dùng (User Repository) ở lớp Domain
/// </summary>
public interface IUserRepository
{
    /// <summary>
    /// Tìm kiếm người dùng bằng địa chỉ Email
    /// </summary>
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken);

    /// <summary>
    /// Tìm kiếm người dùng bằng số điện thoại
    /// </summary>
    Task<User?> GetByPhoneAsync(string phone, CancellationToken cancellationToken);

    /// <summary>
    /// Khởi tạo người dùng mới và băm mật khẩu
    /// </summary>
    Task<IdentityResult> CreateAsync(User user, string password);

    /// <summary>
    /// Tìm kiếm người dùng bằng ID
    /// </summary>
    Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>
    /// Kiểm tra mật khẩu của người dùng
    /// </summary>
    Task<bool> CheckPasswordAsync(User user, string password);

    /// <summary>
    /// Cập nhật thông tin người dùng
    /// </summary>
    Task<IdentityResult> UpdateAsync(User user);

    /// <summary>
    /// Đặt lại mật khẩu mới cho người dùng
    /// </summary>
    Task<IdentityResult> ResetPasswordAsync(User user, string newPassword);

    /// <summary>
    /// Tìm kiếm thông tin hồ sơ người dùng kèm danh sách chuyến đi
    /// </summary>
    Task<User?> GetProfileByIdAsync(Guid id, CancellationToken cancellationToken);
}
