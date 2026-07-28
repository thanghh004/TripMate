using MediatR;
using TripMate.Domain.Constants;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Users.Commands.CheckOtp;

/// <summary>
/// Handler kiểm tra OTP hợp lệ mà KHÔNG đánh dấu đã sử dụng
/// </summary>
public class CheckOtpCommandHandler : IRequestHandler<CheckOtpCommand, bool>
{
    private readonly IUserRepository _userRepository;
    private readonly IOtpService _otpService;

    public CheckOtpCommandHandler(IUserRepository userRepository, IOtpService otpService)
    {
        _userRepository = userRepository;
        _otpService = otpService;
    }

    public async Task<bool> Handle(CheckOtpCommand request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLower();
        var type = string.IsNullOrWhiteSpace(request.Type) ? VerificationTypeConstants.ResetPassword : request.Type.Trim();

        // 1. Kiểm tra tài khoản có tồn tại không
        var user = await _userRepository.GetByEmailAsync(email, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException("Không tìm thấy thông tin tài khoản với địa chỉ email này.");
        }

        // 2. Chỉ kiểm tra OTP hợp lệ, KHÔNG đánh dấu đã sử dụng
        var isValid = await _otpService.CheckOtpAsync(email, request.Code.Trim(), type);
        if (!isValid)
        {
            throw new BusinessRuleException("Mã OTP không chính xác, đã hết hạn hoặc đã được sử dụng trước đó.");
        }

        return true;
    }
}
