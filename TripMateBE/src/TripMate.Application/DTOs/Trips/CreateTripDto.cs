namespace TripMate.Application.DTOs.Trips;

/// <summary>
/// DTO chứa thông tin nhận vào khi khởi tạo chuyến đi mới từ Client
/// </summary>
public class CreateTripDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
}
