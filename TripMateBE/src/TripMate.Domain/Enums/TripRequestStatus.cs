namespace TripMate.Domain.Enums;

/// <summary>
/// Trạng thái yêu cầu tham gia chuyến đi
/// </summary>
public enum TripRequestStatus
{
    /// <summary>
    /// Đang chờ Người tổ chức xét duyệt
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Đã được duyệt tham gia chuyến đi
    /// </summary>
    Approved = 1,

    /// <summary>
    /// Bị Người tổ chức từ chối tham gia
    /// </summary>
    Rejected = 2,

    /// <summary>
    /// Người tham gia đã tự hủy yêu cầu của mình
    /// </summary>
    Cancelled = 3
}
