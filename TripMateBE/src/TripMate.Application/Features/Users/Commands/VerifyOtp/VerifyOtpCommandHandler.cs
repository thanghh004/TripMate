using MediatR;
using TripMate.Domain.Constants;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Users.Commands.VerifyOtp;

/// <summary>
/// Handler xử lý xác thực mã OTP Email
/// </summary>
public class VerifyOtpCommandHandler : IRequestHandler<VerifyOtpCommand, bool>
{
    private readonly IUserRepository _userRepository;
    private readonly IOtpService _otpService;

    public VerifyOtpCommandHandler(IUserRepository userRepository, IOtpService otpService)
    {
        _userRepository = userRepository;
        _otpService = otpService;
    }

    public async Task<bool> Handle(VerifyOtpCommand request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLower();
        var type = string.IsNullOrWhiteSpace(request.Type) ? VerificationTypeConstants.Register : request.Type.Trim();

        // 1. Kiểm tra tài khoản người dùng có tồn tại không
        var user = await _userRepository.GetByEmailAsync(email, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException("Không tìm thấy thông tin tài khoản với địa chỉ email này.");
        }

        // 2. Thực hiện xác thực OTP với Type tương ứng (Register hoặc ResetPassword)
        var isValid = await _otpService.VerifyOtpAsync(email, request.Code.Trim(), type);
        if (!isValid)
        {
            throw new BusinessRuleException("Mã OTP không chính xác, đã hết hạn hoặc đã được sử dụng trước đó.");
        }

        // 3. Nếu là luồng Đăng ký (Register) -> Đánh dấu tài khoản đã xác thực Email thành công
        if (type.Equals(VerificationTypeConstants.Register, StringComparison.OrdinalIgnoreCase))
        {
            user.EmailConfirmed = true;
            user.UpdatedAt = DateTime.UtcNow;

            var result = await _userRepository.UpdateAsync(user);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToArray();
                throw new BusinessRuleException($"Cập nhật trạng thái xác thực thất bại: {string.Join(" ", errors)}");
            }
        }

        return true;
    }
}
