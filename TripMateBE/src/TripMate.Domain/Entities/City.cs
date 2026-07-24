using TripMate.Domain.Common;

namespace TripMate.Domain.Entities;

/// <summary>
/// Thực thể Thành phố / Tỉnh (City / Province)
/// </summary>
public class City : BaseEntity
{
    /// <summary>
    /// ID Quốc gia mà thành phố này thuộc về
    /// </summary>
    public Guid CountryId { get; set; }

    /// <summary>
    /// Tên Thành phố / Tỉnh (Ví dụ: Hà Nội, Đà Nẵng, TP. Hồ Chí Minh, Tokyo...)
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Chuỗi định danh URL không dấu (VD: ha-noi, da-nang)
    /// </summary>
    public string? Slug { get; set; }

    /// <summary>
    /// Thứ tự hiển thị ưu tiên trên dropdown
    /// </summary>
    public int DisplayOrder { get; set; } = 0;

    /// <summary>
    /// Trạng thái kích hoạt (True: Cho phép chọn, False: Ẩn)
    /// </summary>
    public bool IsActive { get; set; } = true;

    #region Navigation Properties

    /// <summary>
    /// Quốc gia chủ quản
    /// </summary>
    public virtual Country Country { get; set; } = null!;

    /// <summary>
    /// Danh sách các chuyến đi có điểm khởi hành từ thành phố này
    /// </summary>
    public virtual ICollection<Trip> StartTrips { get; set; } = new List<Trip>();

    /// <summary>
    /// Danh sách các chuyến đi có điểm đến là thành phố này
    /// </summary>
    public virtual ICollection<Trip> DestinationTrips { get; set; } = new List<Trip>();

    #endregion
}
