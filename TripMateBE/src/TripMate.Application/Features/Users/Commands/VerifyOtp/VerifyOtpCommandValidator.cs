using FluentValidation;

namespace TripMate.Application.Features.Users.Commands.VerifyOtp;

/// <summary>
/// Trình kiểm tra hợp lệ dữ liệu đầu vào xác thực OTP
/// </summary>
public class VerifyOtpCommandValidator : AbstractValidator<VerifyOtpCommand>
{
    public VerifyOtpCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Địa chỉ email không được để trống.")
            .EmailAddress().WithMessage("Địa chỉ email không đúng định dạng.");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Mã OTP không được để trống.")
            .Length(6).WithMessage("Mã OTP phải bao gồm đúng 6 chữ số.")
            .Matches(@"^[0-9]+$").WithMessage("Mã OTP chỉ được chứa các chữ số.");
    }
}
