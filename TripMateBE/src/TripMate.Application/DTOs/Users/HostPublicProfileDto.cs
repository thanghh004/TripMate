namespace TripMate.Application.DTOs.Users;

public class HostPublicProfileDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public double Rating { get; set; } = 5.0;
    public int TotalCreatedTrips { get; set; }
    public int CompletedTripsCount { get; set; }
    public int UncompletedTripsCount { get; set; }
}
