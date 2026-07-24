using MediatR;
using TripMate.Application.DTOs.Trips;

namespace TripMate.Application.Features.Trips.Queries.GetPendingTrips;

public record GetPendingTripsQuery : IRequest<List<TripDto>>;
