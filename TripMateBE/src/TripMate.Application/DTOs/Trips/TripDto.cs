using TripMate.Domain.Enums;

namespace TripMate.Application.DTOs.Trips;

/// <summary>
/// DTO chứa thông tin chi tiết Chuyến đi trả về cho Frontend
/// </summary>
public class TripDto
{
    public Guid Id { get; set; }
    public Guid OrganizerId { get; set; }
    public string OrganizerName { get; set; } = string.Empty;
    public string? OrganizerAvatarUrl { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string StartLocation { get; set; } = string.Empty;
    public Guid? StartCityId { get; set; }
    public string? StartCityName { get; set; }
    public string Destination { get; set; } = string.Empty;
    public Guid? DestinationCityId { get; set; }
    public string? DestinationCityName { get; set; }
    public string? CoverImageUrl { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime? RegistrationDeadline { get; set; }
    public int MaxMembers { get; set; }
    public int CurrentMembers { get; set; }
    public decimal? EstimatedCost { get; set; }
    public string? CostNote { get; set; }
    public string? Requirements { get; set; }
    public int? MinAge { get; set; }
    public int? MaxAge { get; set; }
    public string? PreferredGender { get; set; }
    public TripStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public string? ModerationNote { get; set; }
    public List<string> ImageUrls { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
