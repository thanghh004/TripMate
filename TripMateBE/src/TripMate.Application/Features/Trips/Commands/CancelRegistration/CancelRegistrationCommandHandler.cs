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
        if (string.IsNullOrWhiteSpace(request.Reason))
        {
            throw new ArgumentException("Vui lòng cung cấp lý do hủy đăng ký tham gia chuyến đi.");
        }

        var trip = await _tripRepository.GetByIdWithDetailsAsync(request.TripId, cancellationToken);
        if (trip == null)
        {
            throw new KeyNotFoundException("Không tìm thấy chuyến đi.");
        }

        // 1. Validate Trip Status: Chỉ cho phép Hủy khi Chuyến đi ở trạng thái Open (1) hoặc Full (2)
        if (trip.Status != TripStatus.Open && trip.Status != TripStatus.Full)
        {
            throw new InvalidOperationException("Chuyến đi hiện tại không ở trạng thái mở hoặc đủ người để hủy đăng ký.");
        }

        // 2. Validate Member Status: Chỉ cho phép Hủy khi Thành viên ở trạng thái Pending (0) hoặc Approved (1)
        var member = trip.Members.FirstOrDefault(m => m.UserId == request.UserId);
        if (member == null || (member.Status != TripMemberStatus.Pending && member.Status != TripMemberStatus.Approved))
        {
            throw new InvalidOperationException("Yêu cầu tham gia của bạn không ở trạng thái hợp lệ để hủy đăng ký.");
        }

        // 3. Validate Hủy trước 24h đối với Chuyến đi đã Full (2)
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
