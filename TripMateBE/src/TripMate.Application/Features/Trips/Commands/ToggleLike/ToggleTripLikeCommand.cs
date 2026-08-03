using MediatR;

namespace TripMate.Application.Features.Trips.Commands.ToggleLike;

public record ToggleTripLikeCommand(Guid TripId, Guid UserId) : IRequest<bool>;
