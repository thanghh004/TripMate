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

        repo.SoftDelete(country);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
