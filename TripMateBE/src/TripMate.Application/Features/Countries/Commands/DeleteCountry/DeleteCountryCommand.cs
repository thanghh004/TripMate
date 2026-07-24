using MediatR;

namespace TripMate.Application.Features.Countries.Commands.DeleteCountry;

/// <summary>
/// Command xóa mềm Quốc gia
/// </summary>
public record DeleteCountryCommand(Guid Id) : IRequest<bool>;
