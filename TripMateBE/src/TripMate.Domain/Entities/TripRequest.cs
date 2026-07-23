using TripMate.Domain.Common;
using TripMate.Domain.Enums;

namespace TripMate.Domain.Entities;

/// <summary>
/// Thực thể Yêu cầu xin tham gia chuyến đi (TripRequest)
/// </summary>
public class TripRequest : BaseEntity
{
    /// <summary>
    /// ID chuyến đi muốn tham gia (Khóa ngoại liên kết tới Trip)
    /// </summary>
    public Guid TripId { get; set; }

    /// <summary>
    /// ID người gửi yêu cầu (Khóa ngoại liên kết tới User)
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Lời giới thiệu/tin nhắn gửi kèm khi xin tham gia
    /// </summary>
    public string? Message { get; set; }

    /// <summary>
    /// Trạng thái yêu cầu (Pending, Approved, Rejected, Cancelled)
    /// </summary>
    public TripRequestStatus Status { get; set; } = TripRequestStatus.Pending;

    /// <summary>
    /// Thời gian người tổ chức phản hồi yêu cầu (Chấp nhận hoặc Từ chối)
    /// </summary>
    public DateTime? RespondedAt { get; set; }

    #region Navigation Properties

    /// <summary>
    /// Chuyến đi nhận yêu cầu
    /// </summary>
    public virtual Trip Trip { get; set; } = null!;

    /// <summary>
    /// Người dùng gửi yêu cầu
    /// </summary>
    public virtual User User { get; set; } = null!;

    #endregion
}
