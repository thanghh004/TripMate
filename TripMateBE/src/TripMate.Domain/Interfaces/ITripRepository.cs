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
    /// Lấy danh sách chuyến đi đang chờ Admin duyệt (PendingReview)
    /// </summary>
    Task<List<Trip>> GetPendingTripsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Thêm mới một chuyến đi
    /// </summary>
    Task AddAsync(Trip trip, CancellationToken cancellationToken = default);

    /// <summary>
    /// Cập nhật chuyến đi
    /// </summary>
    void Update(Trip trip);
}
