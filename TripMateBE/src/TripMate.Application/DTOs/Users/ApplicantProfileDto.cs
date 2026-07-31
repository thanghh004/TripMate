namespace TripMate.Application.DTOs.Users;

public class ApplicantProfileDto
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Gender { get; set; }
    public DateTime? BirthDate { get; set; }
    public string? AvatarUrl { get; set; }
    public decimal AvgRating { get; set; } = 5.0m;
}
