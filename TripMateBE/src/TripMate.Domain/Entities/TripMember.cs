using TripMate.Domain.Common;
using TripMate.Domain.Enums;

namespace TripMate.Domain.Entities;

/// <summary>
/// Thực thể Thành viên chính thức tham gia chuyến đi (TripMember)
/// </summary>
public class TripMember : BaseEntity
{
    /// <summary>
    /// ID chuyến đi (Khóa ngoại liên kết tới Trip)
    /// </summary>
    public Guid TripId { get; set; }

    /// <summary>
    /// ID thành viên (Khóa ngoại liên kết tới User)
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Vai trò của thành viên trong chuyến đi (Organizer, Member)
    /// </summary>
    public TripMemberRole Role { get; set; } = TripMemberRole.Member;

    /// <summary>
    /// Thời gian gia nhập chuyến đi
    /// </summary>
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Thời gian rời chuyến đi (nếu có rời nhóm giữa chừng)
    /// </summary>
    public DateTime? LeftAt { get; set; }

    #region Navigation Properties

    /// <summary>
    /// Chuyến đi của thành viên
    /// </summary>
    public virtual Trip Trip { get; set; } = null!;

    /// <summary>
    /// Thông tin chi tiết của thành viên
    /// </summary>
    public virtual User User { get; set; } = null!;

    #endregion
}
