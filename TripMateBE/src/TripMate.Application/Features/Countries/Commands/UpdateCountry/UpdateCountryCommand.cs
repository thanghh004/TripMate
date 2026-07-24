using MediatR;
using TripMate.Application.DTOs.Countries;

namespace TripMate.Application.Features.Countries.Commands.UpdateCountry;

/// <summary>
/// Command cập nhật thông tin Quốc gia
/// </summary>
public record UpdateCountryCommand(
    Guid Id,
    string Name,
    string? Code,
    string? FlagIcon,
    int DisplayOrder,
    bool IsActive
) : IRequest<CountryDto>;
