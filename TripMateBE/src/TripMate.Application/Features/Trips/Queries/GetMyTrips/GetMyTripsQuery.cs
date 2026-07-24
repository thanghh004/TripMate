using MediatR;
using TripMate.Application.DTOs.Trips;

namespace TripMate.Application.Features.Trips.Queries.GetMyTrips;

public record GetMyTripsQuery(Guid UserId) : IRequest<List<TripDto>>;
