using MediatR;

namespace TripMate.Application.Features.Cities.Commands.DeleteCity;

/// <summary>
/// Command xóa mềm Thành phố / Tỉnh
/// </summary>
public record DeleteCityCommand(Guid Id) : IRequest<bool>;
