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

        // Rule: CHỈ DUY NHẤT cho phép hủy chuyến đi khi đang ở trạng thái Chờ duyệt (PendingReview)
        if (trip.Status != TripStatus.PendingReview)
            throw new BusinessRuleException("Chỉ có thể hủy chuyến đi khi đang ở trạng thái Chờ duyệt.");

        // Rule: Bắt buộc phải có lý do hủy
        if (string.IsNullOrWhiteSpace(request.Reason))
            throw new BusinessRuleException("Vui lòng cung cấp lý do hủy chuyến đi.");

        trip.Status = TripStatus.Cancelled;
        trip.CancellationReason = request.Reason;
        trip.UpdatedAt = DateTime.UtcNow;

        _tripRepository.Update(trip);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
