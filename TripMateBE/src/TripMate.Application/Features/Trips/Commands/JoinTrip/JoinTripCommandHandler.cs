using MediatR;
using TripMate.Domain.Entities;
using TripMate.Domain.Enums;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Trips.Commands.JoinTrip;

public class JoinTripCommandHandler : IRequestHandler<JoinTripCommand, bool>
{
    private readonly ITripRepository _tripRepository;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public JoinTripCommandHandler(
        ITripRepository tripRepository,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork)
    {
        _tripRepository = tripRepository;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(JoinTripCommand request, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra Hồ sơ cá nhân của User xem đã cập nhật đầy đủ thông tin chưa
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
            throw new NotFoundException("Không tìm thấy thông tin tài khoản.");

        bool isProfileIncomplete = string.IsNullOrWhiteSpace(user.FullName) ||
                                  string.IsNullOrWhiteSpace(user.PhoneNumber) ||
                                  string.IsNullOrWhiteSpace(user.Gender) ||
                                  !user.BirthDate.HasValue ||
                                  string.IsNullOrWhiteSpace(user.IdentityCardNumber) ||
                                  string.IsNullOrWhiteSpace(user.IdentityCardFrontUrl) ||
                                  string.IsNullOrWhiteSpace(user.IdentityCardBackUrl);

        if (isProfileIncomplete)
        {
            throw new BusinessRuleException("Bạn cần cập nhật đầy đủ thông tin cá nhân (Họ tên, SĐT, Giới tính, Ngày sinh, Số CCCD và 2 mặt ảnh CCCD) trong trang Hồ sơ cá nhân trước khi đăng ký tham gia chuyến đi!");
        }

        var trip = await _tripRepository.GetByIdWithDetailsAsync(request.TripId, cancellationToken);
        if (trip == null)
            throw new NotFoundException("Không tìm thấy chuyến đi.");

        // Rule 1: Host không cần đăng ký tham gia chuyến đi của mình
        if (trip.OrganizerId == request.UserId)
            throw new BusinessRuleException("Bạn là Trưởng đoàn của chuyến đi này.");

        // Rule 2: Chỉ đăng ký được khi chuyến đi ở trạng thái Open
        if (trip.Status != TripStatus.Open)
            throw new BusinessRuleException("Chuyến đi hiện không mở nhận đăng ký.");

        // Rule 3: Đã đủ thành viên
        if (trip.CurrentMembers >= trip.MaxMembers)
            throw new BusinessRuleException("Chuyến đi đã đủ số lượng thành viên tối đa.");

        // Rule 4: Kiểm tra đã tham gia hoặc bị từ chối chưa
        var existingMember = trip.Members?.FirstOrDefault(m => m.UserId == request.UserId);
        if (existingMember != null)
        {
            if (existingMember.Status == TripMemberStatus.Rejected)
                throw new BusinessRuleException("Yêu cầu tham gia của bạn cho chuyến đi này đã bị Trưởng đoàn từ chối.");

            if (existingMember.Status == TripMemberStatus.Pending || existingMember.Status == TripMemberStatus.Approved)
                throw new BusinessRuleException("Bạn đã gửi yêu cầu hoặc tham gia chuyến đi này trước đó.");
        }

        // Rule 5: BẮT BỘC KIỂM TRA TRÙNG LỊCH THỜI GIAN
        bool hasOverlap = await _tripRepository.HasOverlappingTripAsync(
            request.UserId,
            trip.StartDate,
            trip.EndDate,
            null,
            cancellationToken);

        if (hasOverlap)
        {
            throw new BusinessRuleException("Bạn đã có lịch trình chuyến đi khác (tổ chức hoặc tham gia) trùng với khoảng thời gian này. Không thể đăng ký!");
        }

        // Thêm thành viên mới với trạng thái Chờ duyệt (Pending)
        var newMember = new TripMember
        {
            Id = Guid.NewGuid(),
            TripId = trip.Id,
            UserId = request.UserId,
            JoinedAt = DateTime.UtcNow,
            Role = TripMemberRole.Member,
            Status = TripMemberStatus.Pending
        };

        await _tripRepository.AddMemberAsync(newMember, cancellationToken);

        trip.UpdatedAt = DateTime.UtcNow;

        _tripRepository.Update(trip);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
