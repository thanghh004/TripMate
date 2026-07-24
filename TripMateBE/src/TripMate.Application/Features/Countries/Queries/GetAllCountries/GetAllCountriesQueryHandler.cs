using MediatR;
using TripMate.Application.DTOs.Countries;
using TripMate.Domain.Entities;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Countries.Queries.GetAllCountries;

public class GetAllCountriesQueryHandler : IRequestHandler<GetAllCountriesQuery, List<CountryDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAllCountriesQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<CountryDto>> Handle(GetAllCountriesQuery request, CancellationToken cancellationToken)
    {
        var repo = _unitOfWork.Repository<Country>();

        IEnumerable<Country> countries;
        if (request.IsActive.HasValue)
        {
            countries = await repo.FindWithDeletedAsync(c => c.IsActive == request.IsActive.Value);
        }
        else
        {
            countries = await repo.GetAllWithDeletedAsync();
        }

        return countries
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
            .Select(c => new CountryDto
            {
                Id = c.Id,
                Name = c.Name,
                Code = c.Code,
                FlagIcon = c.FlagIcon,
                DisplayOrder = c.DisplayOrder,
                IsActive = c.IsActive,
                IsDeleted = c.IsDeleted,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            })
            .ToList();
    }
}
