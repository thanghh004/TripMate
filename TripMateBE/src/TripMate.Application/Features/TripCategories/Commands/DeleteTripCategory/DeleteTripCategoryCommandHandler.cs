using MediatR;
using TripMate.Domain.Entities;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.TripCategories.Commands.DeleteTripCategory;

public class DeleteTripCategoryCommandHandler : IRequestHandler<DeleteTripCategoryCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteTripCategoryCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteTripCategoryCommand request, CancellationToken cancellationToken)
    {
        var repo = _unitOfWork.Repository<TripCategory>();

        var category = await repo.GetByIdAsync(request.Id);
        if (category == null)
        {
            throw new NotFoundException($"Không tìm thấy loại chuyến đi với ID: {request.Id}");
        }

        repo.SoftDelete(category);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
