using MediatR;
using TripMate.Application.DTOs.Trips;

namespace TripMate.Application.Features.Trips.Commands.UpdateTrip;

public record UpdateTripCommand(
    Guid TripId,
    Guid UserId,
    UpdateTripDto Dto
) : IRequest<TripDto>;
