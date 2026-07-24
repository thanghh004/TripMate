using MediatR;
using TripMate.Application.DTOs.Trips;

namespace TripMate.Application.Features.Trips.Commands.RejectTrip;

public record RejectTripCommand(
    Guid TripId,
    RejectTripDto Dto
) : IRequest<TripDto>;
