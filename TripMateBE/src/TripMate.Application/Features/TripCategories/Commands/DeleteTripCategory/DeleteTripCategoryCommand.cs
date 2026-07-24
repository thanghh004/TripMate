using MediatR;

namespace TripMate.Application.Features.TripCategories.Commands.DeleteTripCategory;

public record DeleteTripCategoryCommand(Guid Id) : IRequest<bool>;
