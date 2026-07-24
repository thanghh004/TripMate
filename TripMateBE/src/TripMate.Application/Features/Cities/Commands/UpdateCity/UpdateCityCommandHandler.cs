using MediatR;
using TripMate.Application.DTOs.Cities;
using TripMate.Domain.Entities;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Cities.Commands.UpdateCity;

public class UpdateCityCommandHandler : IRequestHandler<UpdateCityCommand, CityDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateCityCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CityDto> Handle(UpdateCityCommand request, CancellationToken cancellationToken)
    {
        var cityRepo = _unitOfWork.Repository<City>();
        var city = await cityRepo.GetByIdAsync(request.Id);
        if (city == null)
        {
            throw new NotFoundException($"Không tìm thấy thành phố với ID: {request.Id}");
        }

        if (city.IsDeleted)
        {
            throw new BusinessRuleException($"Thành phố '{city.Name}' đã bị xóa khỏi hệ thống, không thể chỉnh sửa hoặc thay đổi trạng thái.");
        }

        var countryRepo = _unitOfWork.Repository<Country>();
        var country = await countryRepo.GetByIdAsync(request.CountryId);
        if (country == null)
        {
            throw new NotFoundException($"Không tìm thấy quốc gia với ID: {request.CountryId}");
        }

        if (!country.IsActive)
        {
            throw new BusinessRuleException($"Quốc gia '{country.Name}' hiện đang dừng hoạt động, không thể chọn để gắn thành phố.");
        }

        var name = request.Name.Trim();
        var existing = await cityRepo.FindAsync(c => c.CountryId == request.CountryId && c.Name.ToLower() == name.ToLower() && c.Id != request.Id);
        if (existing.Any())
        {
            throw new ConflictException($"Thành phố '{name}' đã tồn tại thuộc quốc gia này.");
        }

        city.CountryId = request.CountryId;
        city.Name = name;
        city.Slug = request.Slug?.Trim().ToLower();
        city.DisplayOrder = request.DisplayOrder;
        city.IsActive = request.IsActive;
        city.UpdatedAt = DateTime.UtcNow;

        cityRepo.Update(city);
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
            IsDeleted = city.IsDeleted,
            CreatedAt = city.CreatedAt,
            UpdatedAt = city.UpdatedAt
        };
    }
}
