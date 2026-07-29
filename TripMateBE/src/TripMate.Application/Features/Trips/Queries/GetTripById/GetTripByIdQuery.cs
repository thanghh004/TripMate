using MediatR;
using TripMate.Application.DTOs.Trips;

namespace TripMate.Application.Features.Trips.Queries.GetTripById;

/// <summary>
/// Query lấy thông tin chi tiết một chuyến đi theo ID
/// </summary>
public record GetTripByIdQuery(Guid Id) : IRequest<TripDto>;
