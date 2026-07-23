using TripMate.Domain.Enums;

namespace TripMate.Application.DTOs.Users;

/// <summary>
/// DTO chứa thông tin kết quả trả về của Hồ sơ người dùng
/// </summary>
public class UserProfileResponseDto
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Gender { get; set; }
    public DateTime? BirthDate { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public string Role { get; set; } = string.Empty;
    public UserStatus Status { get; set; }
    public string? IdentityCardFrontUrl { get; set; }
    public string? IdentityCardBackUrl { get; set; }
    public string? IdentityCardNumber { get; set; }
    public HostVerificationStatus HostVerificationStatus { get; set; }
    public decimal AvgRating { get; set; }
    public int TotalReviews { get; set; }
    public int TotalTrips { get; set; }
}
