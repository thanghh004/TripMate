namespace TripMate.Application.DTOs.Trips;

/// <summary>
/// DTO chứa thông tin yêu cầu tạo chuyến đi mới từ người dùng
/// </summary>
public class CreateTripRequestDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
}
