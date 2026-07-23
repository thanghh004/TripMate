namespace TripMate.Domain.Enums;

/// <summary>
/// Trạng thái hoạt động của tài khoản người dùng
/// </summary>
public enum UserStatus
{
    /// <summary>
    /// Đang hoạt động bình thường
    /// </summary>
    Active = 0,

    /// <summary>
    /// Đã bị khóa/tạm ngưng hoạt động do vi phạm
    /// </summary>
    Suspended = 1
}
