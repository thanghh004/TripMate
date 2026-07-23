namespace TripMate.Application.DTOs.Admin;

/// <summary>
/// DTO chứa thông tin lý do từ chối duyệt Host từ Admin gửi lên
/// </summary>
public class RejectHostVerificationRequestDto
{
    public string? Reason { get; set; }
}
