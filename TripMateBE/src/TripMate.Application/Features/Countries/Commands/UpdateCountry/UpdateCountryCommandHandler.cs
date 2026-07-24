using MediatR;
using TripMate.Application.DTOs.Countries;
using TripMate.Domain.Entities;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Countries.Commands.UpdateCountry;

public class UpdateCountryCommandHandler : IRequestHandler<UpdateCountryCommand, CountryDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateCountryCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CountryDto> Handle(UpdateCountryCommand request, CancellationToken cancellationToken)
    {
        var repo = _unitOfWork.Repository<Country>();

        var country = await repo.GetByIdAsync(request.Id);
        if (country == null)
        {
            throw new NotFoundException($"Không tìm thấy quốc gia với ID: {request.Id}");
        }

        if (country.IsDeleted)
        {
            throw new BusinessRuleException($"Quốc gia '{country.Name}' đã bị xóa khỏi hệ thống, không thể chỉnh sửa hoặc thay đổi trạng thái.");
        }

        var name = request.Name.Trim();
        var existing = await repo.FindAsync(c => c.Name.ToLower() == name.ToLower() && c.Id != request.Id);
        if (existing.Any())
        {
            throw new ConflictException($"Quốc gia '{name}' đã tồn tại trong hệ thống.");
        }

        // Nếu chuyển sang trạng thái Dừng hoạt động, kiểm tra xem có thành phố nào đang hoạt động thuộc quốc gia này không
        if (!request.IsActive && country.IsActive)
        {
            var activeCities = await _unitOfWork.Repository<City>().FindAsync(c => c.CountryId == request.Id && c.IsActive);
            var activeCitiesList = activeCities.ToList();
            if (activeCitiesList.Any())
            {
                throw new BusinessRuleException($"Không thể dừng hoạt động quốc gia '{country.Name}' vì vẫn còn {activeCitiesList.Count} thành phố/tỉnh đang hoạt động. Vui lòng dừng hoạt động tất cả thành phố thuộc quốc gia này trước.");
            }
        }

        country.Name = name;
        country.Code = request.Code?.Trim().ToUpper();
        country.FlagIcon = request.FlagIcon?.Trim();
        country.DisplayOrder = request.DisplayOrder;
        country.IsActive = request.IsActive;
        country.UpdatedAt = DateTime.UtcNow;

        repo.Update(country);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new CountryDto
        {
            Id = country.Id,
            Name = country.Name,
            Code = country.Code,
            FlagIcon = country.FlagIcon,
            DisplayOrder = country.DisplayOrder,
            IsActive = country.IsActive,
            IsDeleted = country.IsDeleted,
            CreatedAt = country.CreatedAt,
            UpdatedAt = country.UpdatedAt
        };
    }
}
