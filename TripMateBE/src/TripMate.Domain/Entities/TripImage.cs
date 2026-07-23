using TripMate.Domain.Common;

namespace TripMate.Domain.Entities;

/// <summary>
/// Thực thể ảnh chi tiết của chuyến đi (TripImage)
/// </summary>
public class TripImage : BaseEntity
{
    /// <summary>
    /// ID chuyến đi (Khóa ngoại liên kết tới Trip)
    /// </summary>
    public Guid TripId { get; set; }

    /// <summary>
    /// Đường dẫn URL hình ảnh
    /// </summary>
    public string ImageUrl { get; set; } = string.Empty;

    /// <summary>
    /// Thứ tự sắp xếp hiển thị ảnh
    /// </summary>
    public int SortOrder { get; set; } = 0;

    #region Navigation Properties

    /// <summary>
    /// Chuyến đi chứa hình ảnh này
    /// </summary>
    public virtual Trip Trip { get; set; } = null!;

    #endregion
}
