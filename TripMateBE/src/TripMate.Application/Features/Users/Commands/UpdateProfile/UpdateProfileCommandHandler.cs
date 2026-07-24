using MediatR;
using TripMate.Domain.Enums;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Users.Commands.UpdateProfile;

/// <summary>
/// Handler xử lý cập nhật thông tin cá nhân của người dùng
/// </summary>
public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, bool>
{
    private readonly IUserRepository _userRepository;

    public UpdateProfileCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<bool> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra sự tồn tại của người dùng
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException("Không tìm thấy thông tin tài khoản người dùng.");
        }

        // 2. Kiểm tra xem người dùng có chuyến đi đang hoạt động hay không
        var hasActiveTrips = await _userRepository.HasActiveTripsAsync(user.Id, cancellationToken);
        if (hasActiveTrips)
        {
            throw new BusinessRuleException("Bạn không thể chỉnh sửa thông tin cá nhân khi đang tạo hoặc tham gia vào chuyến đi đang hoạt động.");
        }

        // 2. Kiểm tra trùng lặp số điện thoại nếu có thay đổi
        if (!string.IsNullOrWhiteSpace(request.PhoneNumber) && request.PhoneNumber != user.PhoneNumber)
        {
            var existingUserWithPhone = await _userRepository.GetByPhoneAsync(request.PhoneNumber.Trim(), cancellationToken);
            if (existingUserWithPhone != null && existingUserWithPhone.Id != user.Id)
            {
                throw new BusinessRuleException("Số điện thoại này đã được sử dụng bởi một tài khoản khác.");
            }
        }

        // 3. Kiểm tra xem có thay đổi các thông tin xác thực danh tính nhạy cảm hay không
        bool sensitiveInfoChanged =
            (request.PhoneNumber?.Trim() != user.PhoneNumber) ||
            (request.Gender?.Trim() != user.Gender) ||
            (request.BirthDate != user.BirthDate) ||
            (request.IdentityCardNumber?.Trim() != user.IdentityCardNumber) ||
            (request.IdentityCardFrontUrl?.Trim() != user.IdentityCardFrontUrl) ||
            (request.IdentityCardBackUrl?.Trim() != user.IdentityCardBackUrl);

        // Nếu tài khoản đã được phê duyệt Host mà thay đổi thông tin xác thực -> Chuyển về trạng thái Chờ duyệt
        if (user.HostVerificationStatus == HostVerificationStatus.Approved && sensitiveInfoChanged)
        {
            user.HostVerificationStatus = HostVerificationStatus.Pending;
        }

        // 4. Cập nhật các trường thông tin
        user.FullName = request.FullName.Trim();
        user.PhoneNumber = request.PhoneNumber?.Trim();
        user.Gender = request.Gender?.Trim();
        user.BirthDate = request.BirthDate;
        user.Bio = request.Bio?.Trim();
        user.AvatarUrl = request.AvatarUrl?.Trim();
        user.IdentityCardFrontUrl = request.IdentityCardFrontUrl?.Trim();
        user.IdentityCardBackUrl = request.IdentityCardBackUrl?.Trim();
        user.IdentityCardNumber = request.IdentityCardNumber?.Trim();
        user.UpdatedAt = DateTime.UtcNow;

        // 5. Lưu thay đổi vào Cơ sở dữ liệu
        var result = await _userRepository.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(" ", result.Errors.Select(e => e.Description));
            throw new BusinessRuleException($"Cập nhật thông tin thất bại: {errors}");
        }

        return true;
    }
}
