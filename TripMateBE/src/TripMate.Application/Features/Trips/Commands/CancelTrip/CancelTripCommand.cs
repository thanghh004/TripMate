using MediatR;

namespace TripMate.Application.Features.Trips.Commands.CancelTrip;

public record CancelTripCommand(
    Guid TripId,
    Guid UserId,
    bool IsAdmin,
    string? Reason
) : IRequest<bool>;
