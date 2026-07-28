using MediatR;
using TripMate.Domain.Constants;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Users.Commands.ResendOtp;

/// <summary>
/// Handler xử lý gửi lại mã OTP đăng ký tài khoản
/// </summary>
public class ResendOtpCommandHandler : IRequestHandler<ResendOtpCommand, bool>
{
    private readonly IUserRepository _userRepository;
    private readonly IOtpService _otpService;

    public ResendOtpCommandHandler(IUserRepository userRepository, IOtpService otpService)
    {
        _userRepository = userRepository;
        _otpService = otpService;
    }

    public async Task<bool> Handle(ResendOtpCommand request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLower();

        // 1. Kiểm tra tài khoản có tồn tại không
        var user = await _userRepository.GetByEmailAsync(email, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException("Không tìm thấy thông tin tài khoản với địa chỉ email này.");
        }

        // 2. Nếu tài khoản đã xác thực email rồi thì không cần gửi nữa
        if (user.EmailConfirmed)
        {
            throw new BusinessRuleException("Tài khoản này đã được xác thực Email trước đó.");
        }

        // 3. Sinh mã OTP mới với type = "Register" và gửi email
        await _otpService.GenerateOtpAsync(email, VerificationTypeConstants.Register);

        return true;
    }
}
