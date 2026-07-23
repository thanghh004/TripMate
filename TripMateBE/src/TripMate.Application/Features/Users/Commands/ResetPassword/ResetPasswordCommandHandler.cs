using MediatR;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Users.Commands.ResetPassword;

/// <summary>
/// Handler xử lý xác thực OTP và cập nhật mật khẩu mới
/// </summary>
public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, bool>
{
    private readonly IUserRepository _userRepository;
    private readonly IOtpService _otpService;

    public ResetPasswordCommandHandler(IUserRepository userRepository, IOtpService otpService)
    {
        _userRepository = userRepository;
        _otpService = otpService;
    }

    public async Task<bool> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLower();

        // 1. Kiểm tra tài khoản có tồn tại không
        var user = await _userRepository.GetByEmailAsync(email, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException("Địa chỉ Email này không tồn tại trong hệ thống.");
        }

        // 2. Xác thực mã OTP loại "ResetPassword"
        var isValid = await _otpService.VerifyOtpAsync(email, request.Code.Trim(), "ResetPassword");
        if (!isValid)
        {
            throw new BusinessRuleException("Mã OTP không chính xác, đã hết hạn hoặc đã được sử dụng.");
        }

        // 3. Tiến hành đặt lại mật khẩu mới
        var result = await _userRepository.ResetPasswordAsync(user, request.NewPassword);
        if (!result.Succeeded)
        {
            var errors = string.Join(" ", result.Errors.Select(e => e.Description));
            throw new BusinessRuleException($"Đặt lại mật khẩu thất bại: {errors}");
        }

        return true;
    }
}
