using TripMate.Domain.Common;

namespace TripMate.Domain.Entities;

/// <summary>
/// Thực thể Tin nhắn Chat (ChatMessage) cho tính năng chat nhóm realtime
/// </summary>
public class ChatMessage : BaseEntity
{
    /// <summary>
    /// ID chuyến đi (mỗi chuyến đi là một phòng chat)
    /// </summary>
    public Guid TripId { get; set; }

    /// <summary>
    /// ID người gửi tin nhắn (khóa ngoại liên kết tới User)
    /// </summary>
    public Guid SenderId { get; set; }

    /// <summary>
    /// Nội dung tin nhắn chat
    /// </summary>
    public string MessageText { get; set; } = string.Empty;

    /// <summary>
    /// Đường dẫn file đính kèm (ảnh, tài liệu...) nếu có
    /// </summary>
    public string? AttachmentUrl { get; set; }

    /// <summary>
    /// Thời gian gửi tin nhắn (sử dụng CreatedAt từ BaseEntity)
    /// </summary>
    public DateTime SentAt
    {
        get => CreatedAt;
        set => CreatedAt = value;
    }

    #region Navigation Properties

    /// <summary>
    /// Chuyến đi (phòng chat) tương ứng của tin nhắn
    /// </summary>
    public virtual Trip Trip { get; set; } = null!;

    /// <summary>
    /// Người gửi tin nhắn
    /// </summary>
    public virtual User Sender { get; set; } = null!;

    #endregion
}
