using MediatR;
using TripMate.Domain.Enums;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Trips.Commands.ApproveTripMember;

public class ApproveTripMemberCommandHandler : IRequestHandler<ApproveTripMemberCommand, bool>
{
    private readonly ITripRepository _tripRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ApproveTripMemberCommandHandler(ITripRepository tripRepository, IUnitOfWork unitOfWork)
    {
        _tripRepository = tripRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(ApproveTripMemberCommand request, CancellationToken cancellationToken)
    {
        var trip = await _tripRepository.GetByIdWithDetailsAsync(request.TripId, cancellationToken);
        if (trip == null)
            throw new NotFoundException("Không tìm thấy chuyến đi.");

        if (trip.OrganizerId != request.OrganizerId)
            throw new BusinessRuleException("Bạn không có quyền quản lý thành viên cho chuyến đi này.");

        var member = trip.Members.FirstOrDefault(m => m.UserId == request.MemberUserId);
        if (member == null)
            throw new NotFoundException("Không tìm thấy yêu cầu đăng ký của thành viên này.");

        if (member.Status == TripMemberStatus.Approved)
            throw new BusinessRuleException("Thành viên này đã được duyệt trước đó.");

        if (trip.CurrentMembers >= trip.MaxMembers)
            throw new BusinessRuleException("Chuyến đi đã đủ số lượng thành viên tối đa, không thể duyệt thêm.");

        // Phê duyệt thành viên
        member.Status = TripMemberStatus.Approved;
        trip.CurrentMembers += 1;

        if (trip.CurrentMembers >= trip.MaxMembers)
        {
            trip.Status = TripStatus.Full;
        }

        trip.UpdatedAt = DateTime.UtcNow;

        _tripRepository.Update(trip);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
