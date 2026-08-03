using MediatR;
using TripMate.Application.DTOs.Trips;

namespace TripMate.Application.Features.Trips.Queries.GetComments;

public record GetTripCommentsQuery(Guid TripId) : IRequest<List<TripCommentDto>>;
