using MediatR;
using TripMate.Application.DTOs.Trips;

namespace TripMate.Application.Features.Trips.Queries.GetPublicTrips;

public record GetPublicTripsQuery : IRequest<List<TripDto>>;
