using MediatR;
using TripMate.Application.DTOs.Trips;

namespace TripMate.Application.Features.Trips.Commands.CreateTrip;

public record CreateTripCommand(
    Guid OrganizerId,
    CreateTripDto Dto
) : IRequest<TripDto>;
