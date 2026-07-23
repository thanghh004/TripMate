using TripMate.Domain.Enums;

namespace TripMate.Application.DTOs.Admin;

/// <summary>
/// DTO chứa thông tin Admin cập nhật trạng thái / vai trò người dùng từ Client gửi lên
/// </summary>
public class AdminUpdateUserRequestDto
{
    public UserRole Role { get; set; }
    public UserStatus Status { get; set; }
    public HostVerificationStatus HostVerificationStatus { get; set; }
}
