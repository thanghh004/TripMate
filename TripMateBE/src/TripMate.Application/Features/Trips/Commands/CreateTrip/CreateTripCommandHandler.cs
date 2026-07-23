using MediatR;
using TripMate.Application.DTOs.Trips;
using TripMate.Domain.Enums;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Trips.Commands.CreateTrip;

/// <summary>
/// Handler xử lý tạo chuyến đi mới và thực thi kiểm tra phân quyền Host 100% tại Backend
/// </summary>
public class CreateTripCommandHandler : IRequestHandler<CreateTripCommand, CreateTripResponseDto>
{
    private readonly IUserRepository _userRepository;

    public CreateTripCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<CreateTripResponseDto> Handle(CreateTripCommand request, CancellationToken cancellationToken)
    {
        // 1. Tìm thông tin người dùng trong CSDL Backend theo UserId từ Token Claims
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException("Không tìm thấy thông tin tài khoản người dùng.");
        }

        // 2. XÉT QUYỀN VÀ NGHỆP VỤ BẢO MẬT 100% TẠI BACKEND:
        // Chỉ Admin hoặc User đã được Admin phê duyệt (HostVerificationStatus == Approved) mới có quyền tạo chuyến đi.
        var isHostAllowed = user.Role == UserRole.Admin || user.HostVerificationStatus == HostVerificationStatus.Approved;

        if (!isHostAllowed)
        {
            if (user.HostVerificationStatus == HostVerificationStatus.Pending)
            {
                throw new BusinessRuleException("Tài khoản của bạn đang chờ Admin xét duyệt quyền tạo chuyến. Vui lòng quay lại sau!");
            }

            if (user.HostVerificationStatus == HostVerificationStatus.Rejected)
            {
                throw new BusinessRuleException("Yêu cầu cấp quyền tạo chuyến của bạn đã bị từ chối. Vui lòng quay lại sau!");
            }

            throw new BusinessRuleException("Bạn chưa đăng ký quyền Tạo chuyến. Vui lòng gửi yêu cầu trong phần cài đặt!");
        }

        // 3. Trả về kết quả khởi tạo chuyến đi công khai thành công
        return new CreateTripResponseDto
        {
            TripId = Guid.NewGuid(),
            Title = string.IsNullOrWhiteSpace(request.Title) ? "Chuyến đi mới" : request.Title.Trim(),
            Message = "Khởi tạo chuyến đi mới thành công! Bạn có đầy đủ quyền Organizer để đăng chuyến."
        };
    }
}
