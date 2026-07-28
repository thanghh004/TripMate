namespace TripMate.Domain.Constants;

/// <summary>
/// Các loại xác thực OTP dùng trong hệ thống
/// Dùng constants thay cho magic string để tránh lỗi typo và dễ bảo trì
/// </summary>
public static class VerificationTypeConstants
{
    /// <summary>
    /// OTP xác thực kích hoạt tài khoản sau khi Đăng ký
    /// </summary>
    public const string Register = "Register";

    /// <summary>
    /// OTP xác thực luồng Quên mật khẩu / Đặt lại mật khẩu
    /// </summary>
    public const string ResetPassword = "ResetPassword";
}
