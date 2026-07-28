using MediatR;
using TripMate.Domain.Constants;

namespace TripMate.Application.Features.Users.Commands.VerifyOtp;

/// <summary>
/// Command xác thực mã OTP gửi về Email
/// Type mặc định là Register, truyền VerificationTypeConstants.ResetPassword cho luồng Quên mật khẩu
/// </summary>
public record VerifyOtpCommand(
    string Email,
    string Code,
    string? Type = VerificationTypeConstants.Register
) : IRequest<bool>;
