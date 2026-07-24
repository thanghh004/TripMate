using MediatR;
using TripMate.Domain.Entities;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Countries.Commands.DeleteCountry;

public class DeleteCountryCommandHandler : IRequestHandler<DeleteCountryCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteCountryCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteCountryCommand request, CancellationToken cancellationToken)
    {
        var repo = _unitOfWork.Repository<Country>();

        var country = await repo.GetByIdAsync(request.Id);
        if (country == null)
        {
            throw new NotFoundException($"Không tìm thấy quốc gia với ID: {request.Id}");
        }

        // Kiểm tra xem có thành phố nào thuộc quốc gia này đang hoạt động hay không
        var activeCities = await _unitOfWork.Repository<City>().FindAsync(c => c.CountryId == request.Id && c.IsActive);
        var activeCitiesList = activeCities.ToList();
        if (activeCitiesList.Any())
        {
            throw new BusinessRuleException($"Không thể xóa quốc gia '{country.Name}' vì vẫn còn thành phố/tỉnh đang hoạt động. Vui lòng dừng hoạt động/xóa tất cả thành phố thuộc quốc gia này trước.");
        }

        repo.SoftDelete(country);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
