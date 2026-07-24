using MediatR;
using TripMate.Application.DTOs.Countries;
using TripMate.Domain.Entities;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Countries.Commands.CreateCountry;

public class CreateCountryCommandHandler : IRequestHandler<CreateCountryCommand, CountryDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateCountryCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CountryDto> Handle(CreateCountryCommand request, CancellationToken cancellationToken)
    {
        var repo = _unitOfWork.Repository<Country>();
        var name = request.Name.Trim();

        var existing = await repo.FindAsync(c => c.Name.ToLower() == name.ToLower());
        if (existing.Any())
        {
            throw new ConflictException($"Quốc gia '{name}' đã tồn tại trong hệ thống.");
        }

        var country = new Country
        {
            Name = name,
            Code = request.Code?.Trim().ToUpper(),
            FlagIcon = request.FlagIcon?.Trim(),
            DisplayOrder = request.DisplayOrder,
            IsActive = true
        };

        await repo.AddAsync(country);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new CountryDto
        {
            Id = country.Id,
            Name = country.Name,
            Code = country.Code,
            FlagIcon = country.FlagIcon,
            DisplayOrder = country.DisplayOrder,
            IsActive = country.IsActive,
            CreatedAt = country.CreatedAt,
            UpdatedAt = country.UpdatedAt
        };
    }
}
