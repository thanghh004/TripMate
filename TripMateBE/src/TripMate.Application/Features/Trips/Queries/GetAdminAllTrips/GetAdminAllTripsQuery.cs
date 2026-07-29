using MediatR;
using TripMate.Application.DTOs.Trips;

namespace TripMate.Application.Features.Trips.Queries.GetAdminAllTrips;

/// <summary>
/// Query cho Admin lấy toàn bộ danh sách chuyến đi trong hệ thống
/// </summary>
public record GetAdminAllTripsQuery() : IRequest<List<TripDto>>;
