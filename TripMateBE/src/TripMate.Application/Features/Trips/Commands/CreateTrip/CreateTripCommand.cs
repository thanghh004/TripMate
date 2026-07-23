using MediatR;
using TripMate.Application.DTOs.Trips;

namespace TripMate.Application.Features.Trips.Commands.CreateTrip;

/// <summary>
/// Command khởi tạo chuyến đi mới (truyền UserId trích xuất từ Claims)
/// </summary>
public class CreateTripCommand : IRequest<CreateTripResponseDto>
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
}
