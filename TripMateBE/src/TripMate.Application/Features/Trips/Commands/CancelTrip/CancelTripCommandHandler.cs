using MediatR;
using TripMate.Domain.Enums;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Trips.Commands.CancelTrip;

public class CancelTripCommandHandler : IRequestHandler<CancelTripCommand, bool>
{
    private readonly ITripRepository _tripRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CancelTripCommandHandler(ITripRepository tripRepository, IUnitOfWork unitOfWork)
    {
        _tripRepository = tripRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(CancelTripCommand request, CancellationToken cancellationToken)
    {
        var trip = await _tripRepository.GetByIdWithDetailsAsync(request.TripId, cancellationToken);
        if (trip == null)
            throw new NotFoundException("Không tìm thấy chuyến đi.");

        // Rule: Chỉ Organizer hoặc Admin mới có quyền hủy chuyến đi
        if (!request.IsAdmin && trip.OrganizerId != request.UserId)
            throw new BusinessRuleException("Bạn không có quyền hủy chuyến đi này.");

        // Rule: Chuyến đi đã hoàn thành không thể hủy
        if (trip.Status == TripStatus.Completed)
            throw new BusinessRuleException("Chuyến đi đã hoàn thành xuất sắc, không thể hủy bỏ.");

        if (trip.Status == TripStatus.Cancelled)
            throw new BusinessRuleException("Chuyến đi này đã ở trạng thái bị hủy từ trước.");

        trip.Status = TripStatus.Cancelled;
        trip.UpdatedAt = DateTime.UtcNow;

        _tripRepository.Update(trip);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
