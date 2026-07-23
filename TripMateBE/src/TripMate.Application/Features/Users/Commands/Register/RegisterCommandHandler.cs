using MediatR;
using TripMate.Application.DTOs.Auth;
using TripMate.Domain.Entities;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Users.Commands.Register;

/// <summary>
/// Handler xử lý đăng ký tài khoản người dùng mới bằng Email
/// </summary>
public class RegisterCommandHandler : IRequestHandler<RegisterCommand, RegisterResponseDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IOtpService _otpService;

    public RegisterCommandHandler(IUserRepository userRepository, IOtpService otpService)
    {
        _userRepository = userRepository;
        _otpService = otpService;
    }

    public async Task<RegisterResponseDto> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLower();
        var phone = request.PhoneNumber?.Trim();

        // 1. Kiểm tra trùng lặp Email
        var existingUserByEmail = await _userRepository.GetByEmailAsync(email, cancellationToken);
        if (existingUserByEmail != null)
        {
            throw new ConflictException("Địa chỉ email này đã được sử dụng để đăng ký tài khoản.");
        }

        // 2. Kiểm tra trùng lặp Số điện thoại (nếu người dùng có điền SĐT trong thông tin cá nhân)
        if (!string.IsNullOrEmpty(phone))
        {
            var existingUserByPhone = await _userRepository.GetByPhoneAsync(phone, cancellationToken);
            if (existingUserByPhone != null)
            {
                throw new ConflictException("Số điện thoại này đã được liên kết với một tài khoản khác.");
            }
        }

        // 3. Khởi tạo thực thể User
        var newUser = new User
        {
            FullName = request.FullName.Trim(),
            Email = email,
            UserName = email, // Username luôn là Email
            PhoneNumber = phone,
            Status = Domain.Enums.UserStatus.Active
        };

        // 4. Tạo User trong hệ thống (tự động băm mật khẩu)
        var result = await _userRepository.CreateAsync(newUser, request.Password);

        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => e.Description).ToArray();
            throw new BusinessRuleException($"Đăng ký thất bại: {string.Join(" ", errors)}");
        }

        // 5. Sinh mã OTP xác thực và tự động gửi tới Email của người đăng ký
        await _otpService.GenerateOtpAsync(email, "Register");

        return new RegisterResponseDto
        {
            UserId = newUser.Id
        };
    }
}
