using TripMate.Domain.Enums;

namespace TripMate.Application.DTOs.Trips;

public class TripMemberDetailDto
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public TripMemberRole Role { get; set; }
    public TripMemberStatus Status { get; set; }
    public DateTime JoinedAt { get; set; }
}
