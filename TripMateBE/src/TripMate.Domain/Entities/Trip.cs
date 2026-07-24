using TripMate.Domain.Common;
using TripMate.Domain.Enums;

namespace TripMate.Domain.Entities;

/// <summary>
/// Thực thể Chuyến đi (Trip)
/// </summary>
public class Trip : BaseEntity
{
    /// <summary>
    /// ID của người tổ chức chuyến đi (khóa ngoại liên kết tới User)
    /// </summary>
    public Guid OrganizerId { get; set; }

    /// <summary>
    /// ID của danh mục loại hình chuyến đi (khóa ngoại liên kết tới TripCategory)
    /// </summary>
    public Guid CategoryId { get; set; }

    /// <summary>
    /// Tiêu đề chuyến đi
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Mô tả chi tiết lịch trình, kế hoạch chuyến đi
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Điểm bắt đầu / điểm khởi hành của chuyến đi (VD: Hà Nội)
    /// </summary>
    public string StartLocation { get; set; } = string.Empty;

    /// <summary>
    /// FK liên kết tới Quốc gia khởi hành
    /// </summary>
    public Guid? StartCountryId { get; set; }

    /// <summary>
    /// FK liên kết tới Thành phố khởi hành (nếu chọn từ danh mục)
    /// </summary>
    public Guid? StartCityId { get; set; }

    /// <summary>
    /// Điểm đến của chuyến đi
    /// </summary>
    public string Destination { get; set; } = string.Empty;

    /// <summary>
    /// FK liên kết tới Quốc gia điểm đến
    /// </summary>
    public Guid? DestinationCountryId { get; set; }

    /// <summary>
    /// FK liên kết tới Thành phố điểm đến (nếu chọn từ danh mục)
    /// </summary>
    public Guid? DestinationCityId { get; set; }

    /// <summary>
    /// Ảnh bìa chính của chuyến đi
    /// </summary>
    public string? CoverImageUrl { get; set; }

    /// <summary>
    /// Ngày khởi hành chuyến đi
    /// </summary>
    public DateTime StartDate { get; set; }

    /// <summary>
    /// Ngày kết thúc chuyến đi
    /// </summary>
    public DateTime EndDate { get; set; }

    /// <summary>
    /// Hạn cuối cùng để đăng ký tham gia chuyến đi
    /// </summary>
    public DateTime? RegistrationDeadline { get; set; }

    /// <summary>
    /// Số lượng thành viên tối đa cho phép tham gia chuyến đi (không bao gồm Organizer)
    /// </summary>
    public int MaxMembers { get; set; }

    /// <summary>
    /// Số lượng thành viên chính thức hiện tại của chuyến đi
    /// </summary>
    public int CurrentMembers { get; set; } = 1;

    /// <summary>
    /// Chi phí ước tính cho mỗi người
    /// </summary>
    public decimal? EstimatedCost { get; set; }

    /// <summary>
    /// Lưu ý thêm về chi phí (chi phí gồm những gì, cọc trước thế nào...)
    /// </summary>
    public string? CostNote { get; set; }

    /// <summary>
    /// Yêu cầu đặc biệt cho chuyến đi (ví dụ: cần thể lực tốt, xe máy tự túc...)
    /// </summary>
    public string? Requirements { get; set; }

    /// <summary>
    /// Độ tuổi tối thiểu yêu cầu
    /// </summary>
    public int? MinAge { get; set; }

    /// <summary>
    /// Độ tuổi tối đa yêu cầu
    /// </summary>
    public int? MaxAge { get; set; }

    /// <summary>
    /// Yêu cầu về giới tính thành viên tham gia (Nam, Nữ, Không yêu cầu...)
    /// </summary>
    public string? PreferredGender { get; set; }

    /// <summary>
    /// Trạng thái của chuyến đi (PendingReview, Open, Full...)
    /// </summary>
    public TripStatus Status { get; set; } = TripStatus.PendingReview;

    /// <summary>
    /// Ghi chú kiểm duyệt từ Admin (lý do từ chối, yêu cầu chỉnh sửa...)
    /// </summary>
    public string? ModerationNote { get; set; }

    #region Navigation Properties

    /// <summary>
    /// Người tổ chức chuyến đi
    /// </summary>
    public virtual User Organizer { get; set; } = null!;

    /// <summary>
    /// Danh mục loại hình của chuyến đi này
    /// </summary>
    public virtual TripCategory Category { get; set; } = null!;

    /// <summary>
    /// Thành phố khởi hành
    /// </summary>
    public virtual City? StartCity { get; set; }

    /// <summary>
    /// Thành phố điểm đến
    /// </summary>
    public virtual City? DestinationCity { get; set; }

    /// <summary>
    /// Danh sách các hình ảnh chi tiết của chuyến đi
    /// </summary>
    public virtual ICollection<TripImage> Images { get; set; } = new List<TripImage>();

    /// <summary>
    /// Danh sách các yêu cầu xin tham gia chuyến đi này
    /// </summary>
    public virtual ICollection<TripRequest> TripRequests { get; set; } = new List<TripRequest>();

    /// <summary>
    /// Danh sách thành viên chính thức tham gia chuyến đi này
    /// </summary>
    public virtual ICollection<TripMember> Members { get; set; } = new List<TripMember>();

    /// <summary>
    /// Danh sách các báo cáo vi phạm liên quan đến chuyến đi này
    /// </summary>
    public virtual ICollection<Report> Reports { get; set; } = new List<Report>();

    /// <summary>
    /// Danh sách các đánh giá được tạo cho chuyến đi này
    /// </summary>
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    /// <summary>
    /// Danh sách các tin nhắn chat trong chuyến đi này
    /// </summary>
    public virtual ICollection<ChatMessage> ChatMessages { get; set; } = new List<ChatMessage>();

    /// <summary>
    /// Danh sách các bài viết chia sẻ liên quan đến chuyến đi này
    /// </summary>
    public virtual ICollection<Post> Posts { get; set; } = new List<Post>();

    #endregion
}
