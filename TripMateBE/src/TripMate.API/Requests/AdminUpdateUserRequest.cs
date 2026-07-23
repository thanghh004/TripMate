using TripMate.Domain.Enums;

namespace TripMate.API.Requests;

/// <summary>
/// DTO chứa thông tin Admin cập nhật trạng thái/vai trò người dùng
/// </summary>
public class AdminUpdateUserRequest
{
    public UserRole Role { get; set; }
    public UserStatus Status { get; set; }
    public HostVerificationStatus HostVerificationStatus { get; set; }
}
