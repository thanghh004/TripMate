using MediatR;
using TripMate.Application.DTOs.TripCategories;

namespace TripMate.Application.Features.TripCategories.Commands.CreateTripCategory;

public record CreateTripCategoryCommand(
    string Name,
    string Slug,
    string? Icon,
    string? Description,
    int DisplayOrder
) : IRequest<TripCategoryDto>;
