using MediatR;
using TripMate.Domain.Enums;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Trips.Commands.RejectTripMember;

public class RejectTripMemberCommandHandler : IRequestHandler<RejectTripMemberCommand, bool>
{
    private readonly ITripRepository _tripRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RejectTripMemberCommandHandler(ITripRepository tripRepository, IUnitOfWork unitOfWork)
    {
        _tripRepository = tripRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(RejectTripMemberCommand request, CancellationToken cancellationToken)
    {
        var trip = await _tripRepository.GetByIdWithDetailsAsync(request.TripId, cancellationToken);
        if (trip == null)
            throw new NotFoundException("Không tìm thấy chuyến đi.");

        if (trip.OrganizerId != request.OrganizerId)
            throw new BusinessRuleException("Bạn không có quyền quản lý thành viên cho chuyến đi này.");

        var member = trip.Members.FirstOrDefault(m => m.UserId == request.MemberUserId);
        if (member == null)
            throw new NotFoundException("Không tìm thấy yêu cầu đăng ký của thành viên này.");

        // Từ chối yêu cầu tham gia
        member.Status = TripMemberStatus.Rejected;
        trip.UpdatedAt = DateTime.UtcNow;

        _tripRepository.Update(trip);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
