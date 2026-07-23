namespace TripMate.Domain.Enums;

/// <summary>
/// Vai trò của người dùng trong hệ thống
/// </summary>
public enum UserRole
{
    /// <summary>
    /// Người dùng thông thường (Organizer / Traveler)
    /// </summary>
    User = 0,

    /// <summary>
    /// Quản trị viên hệ thống (Kiểm duyệt, quản lý)
    /// </summary>
    Admin = 1
}
