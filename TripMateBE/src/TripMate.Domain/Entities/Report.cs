using TripMate.Domain.Common;
using TripMate.Domain.Enums;

namespace TripMate.Domain.Entities;

/// <summary>
/// Thực thể Báo cáo vi phạm (Report)
/// </summary>
public class Report : BaseEntity
{
    /// <summary>
    /// ID người gửi báo cáo (Khóa ngoại liên kết tới User)
    /// </summary>
    public Guid ReporterId { get; set; }

    /// <summary>
    /// ID người dùng bị báo cáo (Khóa ngoại liên kết tới User - nếu có)
    /// </summary>
    public Guid? ReportedUserId { get; set; }

    /// <summary>
    /// ID chuyến đi bị báo cáo (Khóa ngoại liên kết tới Trip - nếu có)
    /// </summary>
    public Guid? ReportedTripId { get; set; }

    /// <summary>
    /// Lý do báo cáo vi phạm (ví dụ: lừa đảo, hành vi thô lỗ, nội dung phản cảm...)
    /// </summary>
    public string Reason { get; set; } = string.Empty;

    /// <summary>
    /// Mô tả chi tiết hành vi hoặc nội dung vi phạm
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Trạng thái xử lý báo cáo (Pending, Resolved)
    /// </summary>
    public ReportStatus Status { get; set; } = ReportStatus.Pending;

    /// <summary>
    /// Ghi chú từ quản trị viên sau khi xử lý báo cáo
    /// </summary>
    public string? AdminNote { get; set; }

    /// <summary>
    /// Thời gian báo cáo được giải quyết xong bởi quản trị viên
    /// </summary>
    public DateTime? ResolvedAt { get; set; }

    #region Navigation Properties

    /// <summary>
    /// Người gửi báo cáo
    /// </summary>
    public virtual User Reporter { get; set; } = null!;

    /// <summary>
    /// Người dùng bị báo cáo (nếu có)
    /// </summary>
    public virtual User? ReportedUser { get; set; }

    /// <summary>
    /// Chuyến đi bị báo cáo (nếu có)
    /// </summary>
    public virtual Trip? ReportedTrip { get; set; }

    #endregion
}
