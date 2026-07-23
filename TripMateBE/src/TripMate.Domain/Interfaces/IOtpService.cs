namespace TripMate.Domain.Interfaces;

/// <summary>
/// Giao diện dịch vụ quản lý mã xác thực OTP
/// </summary>
public interface IOtpService
{
    /// <summary>
    /// Tạo mới một mã OTP ngẫu nhiên và lưu xuống Database
    /// </summary>
    /// <param name="target">Email hoặc Số điện thoại nhận mã</param>
    /// <param name="type">Loại xác thực (Register, ResetPassword...)</param>
    /// <returns>Chuỗi mã OTP được tạo ra</returns>
    Task<string> GenerateOtpAsync(string target, string type);

    /// <summary>
    /// Kiểm tra và xác thực mã OTP
    /// </summary>
    /// <param name="target">Email hoặc Số điện thoại nhận mã</param>
    /// <param name="code">Mã OTP người dùng nhập</param>
    /// <param name="type">Loại xác thực</param>
    /// <returns>True nếu mã hợp lệ, ngược lại False</returns>
    Task<bool> VerifyOtpAsync(string target, string code, string type);
}
