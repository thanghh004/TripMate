using MediatR;
using TripMate.Application.DTOs.Cities;
using TripMate.Domain.Entities;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Cities.Queries.GetCities;

public class GetCitiesQueryHandler : IRequestHandler<GetCitiesQuery, List<CityDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetCitiesQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<CityDto>> Handle(GetCitiesQuery request, CancellationToken cancellationToken)
    {
        var cityRepo = _unitOfWork.Repository<City>();
        var countryRepo = _unitOfWork.Repository<Country>();

        IEnumerable<City> cities;
        if (request.CountryId.HasValue && request.IsActive.HasValue)
        {
            cities = await cityRepo.FindAsync(c => c.CountryId == request.CountryId.Value && c.IsActive == request.IsActive.Value);
        }
        else if (request.CountryId.HasValue)
        {
            cities = await cityRepo.FindAsync(c => c.CountryId == request.CountryId.Value);
        }
        else if (request.IsActive.HasValue)
        {
            cities = await cityRepo.FindAsync(c => c.IsActive == request.IsActive.Value);
        }
        else
        {
            cities = await cityRepo.GetAllAsync();
        }

        var countries = (await countryRepo.GetAllAsync()).ToDictionary(c => c.Id, c => c.Name);

        return cities
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
            .Select(c => new CityDto
            {
                Id = c.Id,
                CountryId = c.CountryId,
                CountryName = countries.TryGetValue(c.CountryId, out var countryName) ? countryName : string.Empty,
                Name = c.Name,
                Slug = c.Slug,
                DisplayOrder = c.DisplayOrder,
                IsActive = c.IsActive,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            })
            .ToList();
    }
}
