using Microsoft.AspNetCore.Identity;
using TripMate.Domain.Common;
using TripMate.Domain.Enums;

namespace TripMate.Domain.Entities;

/// <summary>
/// Thực thể Người dùng trong hệ thống (Organizer / Traveler / Admin)
/// Kế thừa từ IdentityUser để sử dụng các tính năng bảo mật tích hợp và ISoftDelete để hỗ trợ xóa mềm
/// </summary>
public class User : IdentityUser<Guid>, ISoftDelete
{
    /// <summary>
    /// Họ và tên đầy đủ
    /// </summary>
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// Đường dẫn ảnh đại diện
    /// </summary>
    public string? AvatarUrl { get; set; }

    /// <summary>
    /// Đường dẫn ảnh mặt trước CCCD
    /// </summary>
    public string? IdentityCardFrontUrl { get; set; }

    /// <summary>
    /// Đường dẫn ảnh mặt sau CCCD
    /// </summary>
    public string? IdentityCardBackUrl { get; set; }

    /// <summary>
    /// Giới tính (Nam, Nữ, Khác...)
    /// </summary>
    public string? Gender { get; set; }

    /// <summary>
    /// Ngày sinh
    /// </summary>
    public DateTime? BirthDate { get; set; }

    /// <summary>
    /// Tiểu sử ngắn giới thiệu bản thân
    /// </summary>
    public string? Bio { get; set; }

    /// <summary>
    /// Điểm đánh giá trung bình (từ 1 đến 5 sao)
    /// </summary>
    public decimal AvgRating { get; set; } = 5;

    /// <summary>
    /// Tổng số lượt đánh giá đã nhận
    /// </summary>
    public int TotalReviews { get; set; } = 0;

    /// <summary>
    /// Trạng thái hoạt động tài khoản (Active, Suspended)
    /// </summary>
    public UserStatus Status { get; set; } = UserStatus.Active;

    /// <summary>
    /// Vai trò của người dùng trong hệ thống (User, Admin)
    /// </summary>
    public UserRole Role { get; set; } = UserRole.User;

    /// <summary>
    /// Đánh dấu tài khoản đã bị xóa mềm hay chưa
    /// </summary>
    public bool IsDeleted { get; set; } = false;

    /// <summary>
    /// Thời gian tạo tài khoản
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Thời gian cập nhật thông tin tài khoản lần cuối
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Mã Refresh Token dùng để làm mới Access Token JWT
    /// </summary>
    public string? RefreshToken { get; set; }

    /// <summary>
    /// Thời gian hết hạn của Refresh Token
    /// </summary>
    public DateTime? RefreshTokenExpiryTime { get; set; }

    #region Navigation Properties

    /// <summary>
    /// Danh sách các chuyến đi do người này tổ chức
    /// </summary>
    public virtual ICollection<Trip> OrganizedTrips { get; set; } = new List<Trip>();

    /// <summary>
    /// Danh sách các yêu cầu xin tham gia chuyến đi của người này
    /// </summary>
    public virtual ICollection<TripRequest> TripRequests { get; set; } = new List<TripRequest>();

    /// <summary>
    /// Danh sách các chuyến đi mà người này là thành viên chính thức
    /// </summary>
    public virtual ICollection<TripMember> JoinedTrips { get; set; } = new List<TripMember>();

    /// <summary>
    /// Danh sách các đánh giá do người này thực hiện (Người đánh giá)
    /// </summary>
    public virtual ICollection<Review> GivenReviews { get; set; } = new List<Review>();

    /// <summary>
    /// Danh sách các đánh giá mà người này nhận được (Người được đánh giá)
    /// </summary>
    public virtual ICollection<Review> ReceivedReviews { get; set; } = new List<Review>();

    /// <summary>
    /// Danh sách các báo cáo vi phạm do người này gửi
    /// </summary>
    public virtual ICollection<Report> SentReports { get; set; } = new List<Report>();

    /// <summary>
    /// Danh sách các báo cáo vi phạm nhắm vào người này
    /// </summary>
    public virtual ICollection<Report> ReceivedReports { get; set; } = new List<Report>();

    /// <summary>
    /// Danh sách các thông báo của người dùng
    /// </summary>
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    /// <summary>
    /// Danh sách các tin nhắn chat do người này gửi
    /// </summary>
    public virtual ICollection<ChatMessage> SentChatMessages { get; set; } = new List<ChatMessage>();

    /// <summary>
    /// Danh sách các bài viết chia sẻ của người dùng
    /// </summary>
    public virtual ICollection<Post> Posts { get; set; } = new List<Post>();

    /// <summary>
    /// Danh sách các bình luận của người dùng trên các bài viết
    /// </summary>
    public virtual ICollection<PostComment> PostComments { get; set; } = new List<PostComment>();

    /// <summary>
    /// Danh sách các bài viết mà người dùng đã thích
    /// </summary>
    public virtual ICollection<PostLike> PostLikes { get; set; } = new List<PostLike>();

    #endregion
}
