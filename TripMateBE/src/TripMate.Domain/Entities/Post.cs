using TripMate.Domain.Common;

namespace TripMate.Domain.Entities;

/// <summary>
/// Thực thể Bài viết chia sẻ chuyến đi (Post)
/// </summary>
public class Post : BaseEntity
{
    /// <summary>
    /// ID người viết bài (khóa ngoại liên kết tới User)
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// ID chuyến đi liên quan (khóa ngoại liên kết tới Trip - tùy chọn)
    /// </summary>
    public Guid? TripId { get; set; }

    /// <summary>
    /// Tiêu đề bài viết chia sẻ
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Nội dung chi tiết của bài viết
    /// </summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Ảnh đại diện/ảnh bìa của bài viết
    /// </summary>
    public string? CoverImageUrl { get; set; }

    /// <summary>
    /// Tổng số lượt thích (Like)
    /// </summary>
    public int LikesCount { get; set; } = 0;

    /// <summary>
    /// Tổng số lượt bình luận (Comment)
    /// </summary>
    public int CommentsCount { get; set; } = 0;

    #region Navigation Properties

    /// <summary>
    /// Tác giả bài viết
    /// </summary>
    public virtual User User { get; set; } = null!;

    /// <summary>
    /// Chuyến đi liên kết (nếu có)
    /// </summary>
    public virtual Trip? Trip { get; set; }

    /// <summary>
    /// Danh sách các bình luận của bài viết này
    /// </summary>
    public virtual ICollection<PostComment> Comments { get; set; } = new List<PostComment>();

    /// <summary>
    /// Danh sách các lượt thích của bài viết này
    /// </summary>
    public virtual ICollection<PostLike> Likes { get; set; } = new List<PostLike>();

    #endregion
}
