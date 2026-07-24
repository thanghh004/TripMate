using MediatR;
using TripMate.Domain.Entities;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Cities.Commands.DeleteCity;

public class DeleteCityCommandHandler : IRequestHandler<DeleteCityCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteCityCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteCityCommand request, CancellationToken cancellationToken)
    {
        var repo = _unitOfWork.Repository<City>();

        var city = await repo.GetByIdAsync(request.Id);
        if (city == null)
        {
            throw new NotFoundException($"Không tìm thấy thành phố với ID: {request.Id}");
        }

        repo.SoftDelete(city);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
