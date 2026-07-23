using TripMate.Domain.Common;

namespace TripMate.Domain.Entities;

/// <summary>
/// Thực thể Mã xác thực OTP (VerificationCode)
/// </summary>
public class VerificationCode : BaseEntity
{
    /// <summary>
    /// Số điện thoại hoặc Email nhận mã xác thực
    /// </summary>
    public string Target { get; set; } = string.Empty;

    /// <summary>
    /// Mã OTP xác thực (ví dụ: 6 chữ số)
    /// </summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>
    /// Loại xác thực (ví dụ: Register, ResetPassword, ChangePhone...)
    /// </summary>
    public string VerificationType { get; set; } = string.Empty;

    /// <summary>
    /// Thời gian hết hạn của mã xác thực
    /// </summary>
    public DateTime ExpiryTime { get; set; }

    /// <summary>
    /// Đánh dấu mã này đã được sử dụng hay chưa
    /// </summary>
    public bool IsUsed { get; set; } = false;
}
