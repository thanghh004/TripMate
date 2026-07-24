using TripMate.Domain.Common;

namespace TripMate.Domain.Entities;

/// <summary>
/// Thực thể Quốc gia (Country)
/// </summary>
public class Country : BaseEntity
{
    /// <summary>
    /// Tên quốc gia (Ví dụ: Việt Nam, Nhật Bản, Hàn Quốc...)
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Mã quốc gia chuẩn ISO (Ví dụ: VN, JP, KR...)
    /// </summary>
    public string? Code { get; set; }

    /// <summary>
    /// Icon lá quốc kỳ hoặc URL hình ảnh cờ quốc gia
    /// </summary>
    public string? FlagIcon { get; set; }

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
    /// Danh sách các thành phố / tỉnh thuộc quốc gia này
    /// </summary>
    public virtual ICollection<City> Cities { get; set; } = new List<City>();

    #endregion
}
