using MediatR;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Users.Commands.ForgotPassword;

/// <summary>
/// Handler xử lý gửi mã OTP khôi phục mật khẩu qua Email
/// </summary>
public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, bool>
{
    private readonly IUserRepository _userRepository;
    private readonly IOtpService _otpService;

    public ForgotPasswordCommandHandler(IUserRepository userRepository, IOtpService otpService)
    {
        _userRepository = userRepository;
        _otpService = otpService;
    }

    public async Task<bool> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLower();

        // 1. Kiểm tra xem người dùng có tồn tại trong hệ thống không
        var user = await _userRepository.GetByEmailAsync(email, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException("Địa chỉ Email này chưa được đăng ký trong hệ thống.");
        }

        // 2. Sinh mã OTP 6 số loại "ResetPassword" và tự động gửi tới Email người dùng
        await _otpService.GenerateOtpAsync(email, "ResetPassword");

        return true;
    }
}
