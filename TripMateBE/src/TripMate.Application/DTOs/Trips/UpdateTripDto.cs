namespace TripMate.Application.DTOs.Trips;

/// <summary>
/// DTO yêu cầu Cập nhật Chuyến đi
/// </summary>
public class UpdateTripDto
{
    public Guid CategoryId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string StartLocation { get; set; } = string.Empty;
    public Guid? StartCountryId { get; set; }
    public Guid? StartCityId { get; set; }
    public string Destination { get; set; } = string.Empty;
    public Guid? DestinationCountryId { get; set; }
    public Guid? DestinationCityId { get; set; }
    public string? CoverImageUrl { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime? RegistrationDeadline { get; set; }
    public int MaxMembers { get; set; }
    public decimal? EstimatedCost { get; set; }
    public string? CostNote { get; set; }
    public string? Requirements { get; set; }
    public int? MinAge { get; set; }
    public int? MaxAge { get; set; }
    public string? PreferredGender { get; set; }
    public List<string>? ImageUrls { get; set; }
}
