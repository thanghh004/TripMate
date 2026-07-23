namespace TripMate.Domain.Common;

/// <summary>
/// Giao diện dùng cho cơ chế xóa mềm (Soft Delete)
/// </summary>
public interface ISoftDelete
{
    /// <summary>
    /// Đánh dấu bản ghi đã bị xóa hay chưa
    /// </summary>
    bool IsDeleted { get; set; }
}
