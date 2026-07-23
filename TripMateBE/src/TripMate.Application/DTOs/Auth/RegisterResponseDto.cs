namespace TripMate.Application.DTOs.Auth;

/// <summary>
/// DTO chứa kết quả trả về sau khi Đăng ký tài khoản mới thành công
/// </summary>
public class RegisterResponseDto
{
    public Guid UserId { get; set; }
}
