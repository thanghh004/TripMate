using MediatR;
using TripMate.Domain.Enums;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Trips.Commands.CancelRegistration;

public class CancelRegistrationCommandHandler : IRequestHandler<CancelRegistrationCommand, Unit>
{
    private readonly ITripRepository _tripRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CancelRegistrationCommandHandler(ITripRepository tripRepository, IUnitOfWork unitOfWork)
    {
        _tripRepository = tripRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(CancelRegistrationCommand request, CancellationToken cancellationToken)
    {
        var trip = await _tripRepository.GetByIdWithDetailsAsync(request.TripId, cancellationToken);
        if (trip == null)
        {
            throw new KeyNotFoundException("Không tìm thấy chuyến đi.");
        }

        var member = trip.Members.FirstOrDefault(m => m.UserId == request.UserId);
        if (member == null || member.Status == TripMemberStatus.Cancelled)
        {
            throw new InvalidOperationException("Bạn chưa đăng ký hoặc đã hủy tham gia chuyến đi này.");
        }

        // Nếu chuyến đi đang ở trạng thái Full, yêu cầu hủy trước ngày khởi hành ít nhất 1 ngày (24h)
        if (trip.Status == TripStatus.Full)
        {
            if (DateTime.UtcNow.AddDays(1) > trip.StartDate)
            {
                throw new InvalidOperationException("Chuyến đi đã đủ thành viên và sắp khởi hành trong vòng 24h, bạn không thể hủy đăng ký.");
            }
        }

        // Cập nhật trạng thái thành viên sang Cancelled
        var previousStatus = member.Status;
        member.Status = TripMemberStatus.Cancelled;

        // Nếu thành viên đã được duyệt trước đó -> giảm số lượng thành viên hiện tại
        if (previousStatus == TripMemberStatus.Approved)
        {
            trip.CurrentMembers = Math.Max(0, trip.CurrentMembers - 1);
        }

        // Tự động chuyển đổi trạng thái chuyến đi từ Full -> Open nếu số thành viên giảm xuống dưới MaxMembers
        if (trip.Status == TripStatus.Full && trip.CurrentMembers < trip.MaxMembers)
        {
            trip.Status = TripStatus.Open;
        }

        _tripRepository.Update(trip);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
