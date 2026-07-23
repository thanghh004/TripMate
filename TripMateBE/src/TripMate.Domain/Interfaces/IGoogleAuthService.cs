namespace TripMate.Domain.Interfaces;

/// <summary>
/// Dữ liệu thông tin người dùng nhận được sau khi xác minh Google ID Token
/// </summary>
public record GoogleUserInfo(
    string Email, 
    string Name, 
    string? Picture, 
    string Subject
);

/// <summary>
/// Giao diện dịch vụ xác thực Google Token
/// </summary>
public interface IGoogleAuthService
{
    /// <summary>
    /// Xác minh mã Google ID Token gửi từ Client
    /// </summary>
    /// <param name="idToken">Chuỗi ID Token của Google</param>
    /// <returns>Thông tin người dùng Google nếu mã hợp lệ</returns>
    Task<GoogleUserInfo> ValidateIdTokenAsync(string idToken);
}
