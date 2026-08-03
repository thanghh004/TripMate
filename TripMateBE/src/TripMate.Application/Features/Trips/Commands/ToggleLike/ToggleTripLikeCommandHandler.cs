using MediatR;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Trips.Commands.ToggleLike;

public class ToggleTripLikeCommandHandler : IRequestHandler<ToggleTripLikeCommand, bool>
{
    private readonly ITripRepository _tripRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ToggleTripLikeCommandHandler(ITripRepository tripRepository, IUnitOfWork unitOfWork)
    {
        _tripRepository = tripRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(ToggleTripLikeCommand request, CancellationToken cancellationToken)
    {
        var isLiked = await _tripRepository.ToggleLikeAsync(request.TripId, request.UserId, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return isLiked;
    }
}
