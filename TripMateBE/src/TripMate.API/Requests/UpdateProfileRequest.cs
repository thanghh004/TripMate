namespace TripMate.API.Requests;

/// <summary>
/// DTO chứa thông tin yêu cầu cập nhật hồ sơ từ client gửi lên
/// </summary>
public class UpdateProfileRequest
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
