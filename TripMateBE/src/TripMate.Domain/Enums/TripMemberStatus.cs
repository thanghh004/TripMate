namespace TripMate.Domain.Enums;

/// <summary>
/// Trạng thái đăng ký tham gia của thành viên trong chuyến đi
/// </summary>
public enum TripMemberStatus
{
    /// <summary>
    /// Chờ Host phê duyệt
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Đã được Host duyệt tham gia chính thức
    /// </summary>
    Approved = 1,

    /// <summary>
    /// Bị Host từ chối yêu cầu tham gia
    /// </summary>
    Rejected = 2,

    /// <summary>
    /// Đã hủy tham gia / Rời chuyến đi
    /// </summary>
    Cancelled = 3,

    /// <summary>
    /// Đã hoàn thành chuyến đi cùng đoàn
    /// </summary>
    Completed = 4
}
