namespace TripMate.Domain.Common;

/// <summary>
/// Lớp cơ sở chứa các thuộc tính dùng chung cho cơ chế xóa mềm và kiểm toán (Audit)
/// </summary>
public abstract class BaseEntity : ISoftDelete
{
    /// <summary>
    /// ID duy nhất của thực thể
    /// </summary>
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Đánh dấu bản ghi đã bị xóa mềm hay chưa
    /// </summary>
    public bool IsDeleted { get; set; } = false;

    /// <summary>
    /// Thời gian tạo bản ghi
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Thời gian cập nhật bản ghi lần cuối
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
