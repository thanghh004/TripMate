using MediatR;

namespace TripMate.Application.Features.Users.Commands.ResetPassword;

/// <summary>
/// Command xác thực mã OTP và đặt lại mật khẩu mới
/// </summary>
public record ResetPasswordCommand(
    string Email,
    string Code,
    string NewPassword
) : IRequest<bool>;
