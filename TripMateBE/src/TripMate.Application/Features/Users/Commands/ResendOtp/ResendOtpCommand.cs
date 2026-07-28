using MediatR;

namespace TripMate.Application.Features.Users.Commands.ResendOtp;

/// <summary>
/// Command yêu cầu gửi lại mã OTP xác thực tài khoản (Register)
/// </summary>
public record ResendOtpCommand(string Email) : IRequest<bool>;
