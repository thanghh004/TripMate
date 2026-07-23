using MediatR;
using TripMate.Domain.Interfaces;
using TripMate.Domain.Exceptions;

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

        // 2. Kiểm tra trùng lặp số điện thoại nếu có thay đổi
        if (!string.IsNullOrWhiteSpace(request.PhoneNumber) && request.PhoneNumber != user.PhoneNumber)
        {
            var existingUserWithPhone = await _userRepository.GetByPhoneAsync(request.PhoneNumber.Trim(), cancellationToken);
            if (existingUserWithPhone != null && existingUserWithPhone.Id != user.Id)
            {
                throw new BusinessRuleException("Số điện thoại này đã được sử dụng bởi một tài khoản khác.");
            }
        }

        // 3. Cập nhật các trường thông tin
        user.FullName = request.FullName.Trim();
        user.PhoneNumber = request.PhoneNumber?.Trim();
        user.Gender = request.Gender?.Trim();
        user.BirthDate = request.BirthDate;
        user.Bio = request.Bio?.Trim();
        user.AvatarUrl = request.AvatarUrl?.Trim();
        user.IdentityCardFrontUrl = request.IdentityCardFrontUrl?.Trim();
        user.IdentityCardBackUrl = request.IdentityCardBackUrl?.Trim();
        user.UpdatedAt = DateTime.UtcNow;

        // 4. Lưu thay đổi vào Cơ sở dữ liệu
        var result = await _userRepository.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(" ", result.Errors.Select(e => e.Description));
            throw new BusinessRuleException($"Cập nhật thông tin thất bại: {errors}");
        }

        return true;
    }
}
