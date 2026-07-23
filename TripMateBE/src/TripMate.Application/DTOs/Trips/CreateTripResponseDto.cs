namespace TripMate.Application.DTOs.Trips;

/// <summary>
/// DTO chứa thông tin kết quả phản hồi tạo chuyến đi từ Backend
/// </summary>
public class CreateTripResponseDto
{
    public Guid TripId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
