using TripMate.Domain.Common;

namespace TripMate.Domain.Entities;

/// <summary>
/// Thực thể Thích bài viết (PostLike) - Bảng trung gian thể hiện lượt thích bài viết
/// </summary>
public class PostLike : BaseEntity
{
    /// <summary>
    /// ID bài viết được thích (Khóa ngoại liên kết tới Post)
    /// </summary>
    public Guid PostId { get; set; }

    /// <summary>
    /// ID người thích bài viết (Khóa ngoại liên kết tới User)
    /// </summary>
    public Guid UserId { get; set; }

    #region Navigation Properties

    /// <summary>
    /// Bài viết tương ứng
    /// </summary>
    public virtual Post Post { get; set; } = null!;

    /// <summary>
    /// Người thực hiện thích bài viết
    /// </summary>
    public virtual User User { get; set; } = null!;

    #endregion
}
