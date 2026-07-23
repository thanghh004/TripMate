using TripMate.Domain.Common;

namespace TripMate.Domain.Entities;

/// <summary>
/// Thực thể Bình luận bài viết (PostComment)
/// </summary>
public class PostComment : BaseEntity
{
    /// <summary>
    /// ID bài viết được bình luận (Khóa ngoại liên kết tới Post)
    /// </summary>
    public Guid PostId { get; set; }

    /// <summary>
    /// ID người bình luận (Khóa ngoại liên kết tới User)
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Nội dung bình luận
    /// </summary>
    public string CommentText { get; set; } = string.Empty;

    #region Navigation Properties

    /// <summary>
    /// Bài viết tương ứng của bình luận
    /// </summary>
    public virtual Post Post { get; set; } = null!;

    /// <summary>
    /// Người viết bình luận
    /// </summary>
    public virtual User User { get; set; } = null!;

    #endregion
}
