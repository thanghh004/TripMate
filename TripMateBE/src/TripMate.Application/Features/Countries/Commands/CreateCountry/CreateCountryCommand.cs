using MediatR;
using TripMate.Application.DTOs.Countries;

namespace TripMate.Application.Features.Countries.Commands.CreateCountry;

/// <summary>
/// Command tạo mới Quốc gia
/// </summary>
public record CreateCountryCommand(
    string Name,
    string? Code,
    string? FlagIcon,
    int DisplayOrder = 0
) : IRequest<CountryDto>;
