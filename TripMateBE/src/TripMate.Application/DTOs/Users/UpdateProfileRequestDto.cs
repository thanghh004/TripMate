namespace TripMate.Application.DTOs.Users;

/// <summary>
/// DTO chứa thông tin cập nhật hồ sơ cá nhân từ Client gửi lên
/// </summary>
public class UpdateProfileRequestDto
{
    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Gender { get; set; }
    public DateTime? BirthDate { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public string? IdentityCardFrontUrl { get; set; }
    public string? IdentityCardBackUrl { get; set; }
    public string? IdentityCardNumber { get; set; }
}
