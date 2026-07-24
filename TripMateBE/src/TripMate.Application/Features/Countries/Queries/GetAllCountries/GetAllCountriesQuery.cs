using MediatR;
using TripMate.Application.DTOs.Countries;

namespace TripMate.Application.Features.Countries.Queries.GetAllCountries;

/// <summary>
/// Query lấy danh sách Quốc gia (hỗ trợ lọc theo IsActive)
/// </summary>
public record GetAllCountriesQuery(bool? IsActive = null) : IRequest<List<CountryDto>>;
