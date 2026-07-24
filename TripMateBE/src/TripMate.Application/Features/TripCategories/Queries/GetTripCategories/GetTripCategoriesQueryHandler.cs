using MediatR;
using TripMate.Application.DTOs.TripCategories;
using TripMate.Domain.Entities;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.TripCategories.Queries.GetTripCategories;

public class GetTripCategoriesQueryHandler : IRequestHandler<GetTripCategoriesQuery, List<TripCategoryDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetTripCategoriesQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<TripCategoryDto>> Handle(GetTripCategoriesQuery request, CancellationToken cancellationToken)
    {
        var repo = _unitOfWork.Repository<TripCategory>();

        IEnumerable<TripCategory> categories;
        if (request.IsActive.HasValue)
        {
            categories = await repo.FindWithDeletedAsync(c => c.IsActive == request.IsActive.Value);
        }
        else
        {
            categories = await repo.GetAllWithDeletedAsync();
        }

        return categories
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
            .Select(c => new TripCategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
                Icon = c.Icon,
                Description = c.Description,
                DisplayOrder = c.DisplayOrder,
                IsActive = c.IsActive,
                IsDeleted = c.IsDeleted,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            })
            .ToList();
    }
}
