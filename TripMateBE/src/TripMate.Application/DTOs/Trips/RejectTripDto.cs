namespace TripMate.Application.DTOs.Trips;

/// <summary>
/// DTO Admin nhập lý do từ chối chuyến đi
/// </summary>
public class RejectTripDto
{
    public string Reason { get; set; } = string.Empty;
}
