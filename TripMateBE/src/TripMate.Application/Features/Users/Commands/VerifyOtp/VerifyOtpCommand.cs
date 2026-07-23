using MediatR;

namespace TripMate.Application.Features.Users.Commands.VerifyOtp;

/// <summary>
/// Command xác thực mã OTP gửi về Email
/// </summary>
public record VerifyOtpCommand(
    string Email, 
    string Code
) : IRequest<bool>;
