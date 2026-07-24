using MediatR;
using TripMate.Application.DTOs.Cities;

namespace TripMate.Application.Features.Cities.Queries.GetCities;

/// <summary>
/// Query lấy danh sách Thành phố / Tỉnh (hỗ trợ lọc theo CountryId và IsActive)
/// </summary>
public record GetCitiesQuery(Guid? CountryId = null, bool? IsActive = null) : IRequest<List<CityDto>>;
