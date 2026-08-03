using MediatR;
using TripMate.Application.DTOs.Trips;

namespace TripMate.Application.Features.Trips.Commands.AddComment;

public record AddTripCommentCommand(Guid TripId, Guid UserId, string Content) : IRequest<TripCommentDto>;
