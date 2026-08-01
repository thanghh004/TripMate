using MediatR;

namespace TripMate.Application.Features.Trips.Commands.CancelRegistration;

public record CancelRegistrationCommand(Guid TripId, Guid UserId, string? Reason) : IRequest<Unit>;
