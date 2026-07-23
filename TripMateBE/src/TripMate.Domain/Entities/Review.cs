using TripMate.Domain.Common;

namespace TripMate.Domain.Entities;

/// <summary>
/// Thực thể Đánh giá (Review) hai chiều giữa các thành viên sau khi kết thúc chuyến đi
/// </summary>
public class Review : BaseEntity
{
    /// <summary>
    /// ID chuyến đi liên quan (Khóa ngoại liên kết tới Trip)
    /// </summary>
    public Guid TripId { get; set; }

    /// <summary>
    /// ID của người thực hiện đánh giá (Khóa ngoại liên kết tới User)
    /// </summary>
    public Guid ReviewerId { get; set; }

    /// <summary>
    /// ID của người được nhận đánh giá (Khóa ngoại liên kết tới User)
    /// </summary>
    public Guid RevieweeId { get; set; }

    /// <summary>
    /// Điểm đánh giá số sao (từ 1 đến 5)
    /// </summary>
    public int Rating { get; set; }

    /// <summary>
    /// Nhận xét, nội dung đánh giá chi tiết
    /// </summary>
    public string? Comment { get; set; }

    #region Navigation Properties

    /// <summary>
    /// Chuyến đi tương ứng của bài đánh giá
    /// </summary>
    public virtual Trip Trip { get; set; } = null!;

    /// <summary>
    /// Thông tin người thực hiện đánh giá
    /// </summary>
    public virtual User Reviewer { get; set; } = null!;

    /// <summary>
    /// Thông tin người nhận đánh giá
    /// </summary>
    public virtual User Reviewee { get; set; } = null!;

    #endregion
}
