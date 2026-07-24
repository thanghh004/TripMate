using MediatR;
using TripMate.Application.DTOs.Cities;

namespace TripMate.Application.Features.Cities.Commands.CreateCity;

/// <summary>
/// Command tạo mới Thành phố / Tỉnh
/// </summary>
public record CreateCityCommand(
    Guid CountryId,
    string Name,
    string? Slug,
    int DisplayOrder = 0
) : IRequest<CityDto>;
