using MediatR;
using TripMate.Domain.Constants;

namespace TripMate.Application.Features.Users.Commands.CheckOtp;

/// <summary>
/// Command kiểm tra OTP hợp lệ mà KHÔNG đánh dấu đã sử dụng
/// Dùng cho bước preview trước khi thực sự consume OTP (vd: Quên mật khẩu Bước 2)
/// </summary>
public record CheckOtpCommand(
    string Email,
    string Code,
    string? Type = VerificationTypeConstants.ResetPassword
) : IRequest<bool>;
