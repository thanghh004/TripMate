using MediatR;
using TripMate.Application.DTOs.TripCategories;

namespace TripMate.Application.Features.TripCategories.Queries.GetTripCategories;

public record GetTripCategoriesQuery(bool? IsActive = null) : IRequest<List<TripCategoryDto>>;
