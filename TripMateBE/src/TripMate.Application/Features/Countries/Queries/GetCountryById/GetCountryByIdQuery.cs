using MediatR;
using TripMate.Application.DTOs.Countries;

namespace TripMate.Application.Features.Countries.Queries.GetCountryById;

/// <summary>
/// Query lấy thông tin Quốc gia theo ID
/// </summary>
public record GetCountryByIdQuery(Guid Id) : IRequest<CountryDto>;
