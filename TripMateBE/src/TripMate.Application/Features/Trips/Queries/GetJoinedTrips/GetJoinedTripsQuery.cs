using MediatR;
using TripMate.Application.DTOs.Trips;

namespace TripMate.Application.Features.Trips.Queries.GetJoinedTrips;

public record GetJoinedTripsQuery(Guid UserId) : IRequest<List<TripDto>>;
