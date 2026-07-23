namespace TripMate.Domain.Enums;

/// <summary>
/// Trạng thái xử lý báo cáo vi phạm của Admin
/// </summary>
public enum ReportStatus
{
    /// <summary>
    /// Đang chờ kiểm duyệt/xử lý
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Đã được giải quyết/xử lý xong
    /// </summary>
    Resolved = 1
}
