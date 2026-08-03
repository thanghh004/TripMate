using TripMate.Domain.Entities;
using TripMate.Domain.Enums;

namespace TripMate.Domain.Interfaces;

/// <summary>
/// Giao diện quản lý chuyến đi (Trip Repository) ở lớp Domain
/// </summary>
public interface ITripRepository
{
    /// <summary>
    /// Lấy chuyến đi theo ID đầy đủ thông tin (Include Categories, Cities, Organizer, Images...)
    /// </summary>
    Task<Trip?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Lấy danh sách chuyến đi do một User làm Organizer
    /// </summary>
    Task<List<Trip>> GetMyTripsAsync(Guid organizerId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Lấy danh sách chuyến đi mà người dùng đã gửi yêu cầu/đã tham gia làm thành viên
    /// </summary>
    Task<List<Trip>> GetJoinedTripsAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Lấy danh sách chuyến đi công khai đã duyệt (Open, Full) cho Trang chủ & Khám phá
    /// </summary>
    Task<List<Trip>> GetPublicTripsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Lấy danh sách chuyến đi đang chờ Admin duyệt (PendingReview)
    /// </summary>
    Task<List<Trip>> GetPendingTripsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Lấy danh sách tất cả chuyến đi dành cho Admin
    /// </summary>
    Task<List<Trip>> GetAllTripsForAdminAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Kiểm tra người dùng có chuyến đi nào đang hoạt động (Host hoặc Member) trùng thời gian không
    /// </summary>
    Task<bool> HasOverlappingTripAsync(Guid userId, DateTime startDate, DateTime endDate, Guid? excludeTripId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Thêm thành viên vào chuyến đi
    /// </summary>
    Task AddMemberAsync(TripMember member, CancellationToken cancellationToken = default);

    /// <summary>
    /// Thêm chuyến đi mới vào CSDL
    /// </summary>
    Task AddAsync(Trip trip, CancellationToken cancellationToken = default);

    /// <summary>
    /// Cập nhật thông tin chuyến đi
    /// </summary>
    void Update(Trip trip);

    /// <summary>
    /// Xóa chuyến đi
    /// </summary>
    void Delete(Trip trip);

    /// <summary>
    /// Thả hoặc Bỏ thả tim chuyến đi
    /// </summary>
    Task<bool> ToggleLikeAsync(Guid tripId, Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Thêm bình luận cho chuyến đi
    /// </summary>
    Task<TripComment> AddCommentAsync(Guid tripId, Guid userId, string content, CancellationToken cancellationToken = default);

    /// <summary>
    /// Lấy danh sách bình luận của chuyến đi
    /// </summary>
    Task<List<TripComment>> GetCommentsAsync(Guid tripId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Lấy bình luận theo ID
    /// </summary>
    Task<TripComment?> GetCommentByIdAsync(Guid commentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Xóa bình luận của chuyến đi
    /// </summary>
    void DeleteComment(TripComment comment);
}
