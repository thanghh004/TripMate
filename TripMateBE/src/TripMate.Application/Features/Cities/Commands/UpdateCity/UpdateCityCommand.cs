using MediatR;
using TripMate.Application.DTOs.Cities;

namespace TripMate.Application.Features.Cities.Commands.UpdateCity;

/// <summary>
/// Command cập nhật thông tin Thành phố / Tỉnh
/// </summary>
public record UpdateCityCommand(
    Guid Id,
    Guid CountryId,
    string Name,
    string? Slug,
    int DisplayOrder,
    bool IsActive
) : IRequest<CityDto>;
