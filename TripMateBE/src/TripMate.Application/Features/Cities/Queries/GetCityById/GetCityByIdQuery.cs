using MediatR;
using TripMate.Application.DTOs.Cities;

namespace TripMate.Application.Features.Cities.Queries.GetCityById;

/// <summary>
/// Query lấy thông tin Thành phố / Tỉnh theo ID
/// </summary>
public record GetCityByIdQuery(Guid Id) : IRequest<CityDto>;
