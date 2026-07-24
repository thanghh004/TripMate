using MediatR;
using TripMate.Application.DTOs.Trips;

namespace TripMate.Application.Features.Trips.Commands.ApproveTrip;

public record ApproveTripCommand(
    Guid TripId
) : IRequest<TripDto>;
