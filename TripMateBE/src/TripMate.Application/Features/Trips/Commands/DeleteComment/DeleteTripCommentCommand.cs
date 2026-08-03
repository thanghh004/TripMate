using MediatR;

namespace TripMate.Application.Features.Trips.Commands.DeleteComment;

public record DeleteTripCommentCommand(Guid CommentId, Guid UserId, bool IsAdmin) : IRequest<bool>;
