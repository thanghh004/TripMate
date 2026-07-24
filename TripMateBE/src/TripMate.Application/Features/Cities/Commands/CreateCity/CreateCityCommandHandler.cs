using MediatR;
using TripMate.Application.DTOs.Cities;
using TripMate.Domain.Entities;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Cities.Commands.CreateCity;

public class CreateCityCommandHandler : IRequestHandler<CreateCityCommand, CityDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateCityCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CityDto> Handle(CreateCityCommand request, CancellationToken cancellationToken)
    {
        var countryRepo = _unitOfWork.Repository<Country>();
        var country = await countryRepo.GetByIdAsync(request.CountryId);
        if (country == null)
        {
            throw new NotFoundException($"Không tìm thấy quốc gia với ID: {request.CountryId}");
        }

        var cityRepo = _unitOfWork.Repository<City>();
        var name = request.Name.Trim();

        var existing = await cityRepo.FindAsync(c => c.CountryId == request.CountryId && c.Name.ToLower() == name.ToLower());
        if (existing.Any())
        {
            throw new ConflictException($"Thành phố '{name}' đã tồn tại thuộc quốc gia này.");
        }

        var city = new City
        {
            CountryId = request.CountryId,
            Name = name,
            Slug = request.Slug?.Trim().ToLower(),
            DisplayOrder = request.DisplayOrder,
            IsActive = true
        };

        await cityRepo.AddAsync(city);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new CityDto
        {
            Id = city.Id,
            CountryId = city.CountryId,
            CountryName = country.Name,
            Name = city.Name,
            Slug = city.Slug,
            DisplayOrder = city.DisplayOrder,
            IsActive = city.IsActive,
            CreatedAt = city.CreatedAt,
            UpdatedAt = city.UpdatedAt
        };
    }
}
