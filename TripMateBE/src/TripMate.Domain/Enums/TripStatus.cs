namespace TripMate.Domain.Enums;

/// <summary>
/// Trạng thái của chuyến đi
/// </summary>
public enum TripStatus
{
    /// <summary>
    /// Chờ duyệt bởi Admin
    /// </summary>
    PendingReview = 0,

    /// <summary>
    /// Đang mở đăng ký tham gia
    /// </summary>
    Open = 1,

    /// <summary>
    /// Đã đủ số lượng thành viên tối đa
    /// </summary>
    Full = 2,

    /// <summary>
    /// Chuyến đi đang diễn ra
    /// </summary>
    Ongoing = 3,

    /// <summary>
    /// Chuyến đi đã hoàn thành xuất sắc
    /// </summary>
    Completed = 4,

    /// <summary>
    /// Chuyến đi đã bị hủy bỏ
    /// </summary>
    Cancelled = 5
}
