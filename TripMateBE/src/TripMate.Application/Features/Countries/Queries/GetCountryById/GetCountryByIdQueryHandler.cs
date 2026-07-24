using MediatR;
using TripMate.Application.DTOs.Countries;
using TripMate.Domain.Entities;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Countries.Queries.GetCountryById;

public class GetCountryByIdQueryHandler : IRequestHandler<GetCountryByIdQuery, CountryDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetCountryByIdQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CountryDto> Handle(GetCountryByIdQuery request, CancellationToken cancellationToken)
    {
        var repo = _unitOfWork.Repository<Country>();

        var country = await repo.GetByIdAsync(request.Id);
        if (country == null)
        {
            throw new NotFoundException($"Không tìm thấy quốc gia với ID: {request.Id}");
        }

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
