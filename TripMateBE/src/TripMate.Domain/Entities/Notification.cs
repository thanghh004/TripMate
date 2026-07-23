using TripMate.Domain.Common;

namespace TripMate.Domain.Entities;

/// <summary>
/// Thực thể Thông báo hệ thống (Notification)
/// </summary>
public class Notification : BaseEntity
{
    /// <summary>
    /// ID người dùng nhận thông báo (Khóa ngoại liên kết tới User)
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Loại thông báo (ví dụ: Yêu cầu tham gia, Kết quả xét duyệt, Nhắc lịch khởi hành...)
    /// </summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// Tiêu đề thông báo
    /// </summary>
    public string? Title { get; set; }

    /// <summary>
    /// Nội dung chi tiết thông báo
    /// </summary>
    public string? Content { get; set; }

    /// <summary>
    /// ID chuyến đi liên quan trực tiếp đến thông báo này (nếu có)
    /// </summary>
    public Guid? RelatedTripId { get; set; }

    /// <summary>
    /// Trạng thái đã đọc hay chưa (True: Đã đọc, False: Chưa đọc)
    /// </summary>
    public bool IsRead { get; set; } = false;

    #region Navigation Properties

    /// <summary>
    /// Người dùng sở hữu thông báo này
    /// </summary>
    public virtual User User { get; set; } = null!;

    /// <summary>
    /// Chuyến đi liên quan (nếu có)
    /// </summary>
    public virtual Trip? RelatedTrip { get; set; }

    #endregion
}
