using MediatR;
using TripMate.Application.DTOs.TripCategories;

namespace TripMate.Application.Features.TripCategories.Commands.UpdateTripCategory;

public record UpdateTripCategoryCommand(
    Guid Id,
    string Name,
    string Slug,
    string? Icon,
    string? Description,
    int DisplayOrder,
    bool IsActive
) : IRequest<TripCategoryDto>;
