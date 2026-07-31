using MediatR;

namespace TripMate.Application.Features.Trips.Commands.JoinTrip;

public record JoinTripCommand(Guid TripId, Guid UserId) : IRequest<bool>;
