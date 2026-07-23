using TripMate.Domain.Enums;

namespace TripMate.Application.DTOs.Admin;

/// <summary>
/// DTO riêng cho màn hình Admin duyệt quyền tạo chuyến (Host Verification Requests).
/// Chứa thông tin liên hệ, giấy tờ CCCD, đánh giá trung bình và số chuyến đi.
/// </summary>
public class PendingHostVerificationDto
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Gender { get; set; }
    public DateTime? BirthDate { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public string? IdentityCardNumber { get; set; }
    public string? IdentityCardFrontUrl { get; set; }
    public string? IdentityCardBackUrl { get; set; }
    public HostVerificationStatus HostVerificationStatus { get; set; }
    public decimal AvgRating { get; set; }
    public int TotalTrips { get; set; }
    public DateTime? RequestDate { get; set; }
}
