using MediatR;
using TripMate.Application.DTOs.Cities;
using TripMate.Domain.Entities;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Cities.Queries.GetCityById;

public class GetCityByIdQueryHandler : IRequestHandler<GetCityByIdQuery, CityDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetCityByIdQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CityDto> Handle(GetCityByIdQuery request, CancellationToken cancellationToken)
    {
        var cityRepo = _unitOfWork.Repository<City>();
        var city = await cityRepo.GetByIdAsync(request.Id);
        if (city == null)
        {
            throw new NotFoundException($"Không tìm thấy thành phố với ID: {request.Id}");
        }

        var countryRepo = _unitOfWork.Repository<Country>();
        var country = await countryRepo.GetByIdAsync(city.CountryId);

        return new CityDto
        {
            Id = city.Id,
            CountryId = city.CountryId,
            CountryName = country?.Name ?? string.Empty,
            Name = city.Name,
            Slug = city.Slug,
            DisplayOrder = city.DisplayOrder,
            IsActive = city.IsActive,
            CreatedAt = city.CreatedAt,
            UpdatedAt = city.UpdatedAt
        };
    }
}
