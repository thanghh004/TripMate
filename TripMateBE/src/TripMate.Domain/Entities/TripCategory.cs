using TripMate.Domain.Common;

namespace TripMate.Domain.Entities;

/// <summary>
/// Thực thể Danh mục loại hình chuyến đi (Ví dụ: Leo núi, Cắm trại, Picnic, FoodTour...)
/// Được quản lý động bởi Admin
/// </summary>
public class TripCategory : BaseEntity
{
    /// <summary>
    /// Tên loại hình chuyến đi (VD: Leo núi & Phượt)
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Chuỗi định danh URL không dấu (VD: leo-nui-phuot)
    /// </summary>
    public string Slug { get; set; } = string.Empty;

    /// <summary>
    /// Biểu tượng/icon đại diện cho loại hình (VD: tên class icon hoặc emoji)
    /// </summary>
    public string? Icon { get; set; }

    /// <summary>
    /// Mô tả chi tiết về loại hình chuyến đi
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Thứ tự hiển thị ưu tiên trên giao diện
    /// </summary>
    public int DisplayOrder { get; set; } = 0;

    /// <summary>
    /// Trạng thái kích hoạt (True: Cho phép hiển thị, False: Ẩn)
    /// </summary>
    public bool IsActive { get; set; } = true;

    #region Navigation Properties

    /// <summary>
    /// Danh sách các chuyến đi thuộc loại hình này
    /// </summary>
    public virtual ICollection<Trip> Trips { get; set; } = new List<Trip>();

    #endregion
}
