using MediatR;

namespace TripMate.Application.Features.Users.Commands.ForgotPassword;

/// <summary>
/// Command gửi yêu cầu mã OTP đặt lại mật khẩu về Email
/// </summary>
public record ForgotPasswordCommand(
    string Email
) : IRequest<bool>;
