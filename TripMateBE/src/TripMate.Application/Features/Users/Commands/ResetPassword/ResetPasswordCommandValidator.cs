using FluentValidation;

namespace TripMate.Application.Features.Users.Commands.ResetPassword;

/// <summary>
/// Trình kiểm tra hợp lệ dữ liệu đặt lại mật khẩu mới
/// </summary>
public class ResetPasswordCommandValidator : AbstractValidator<ResetPasswordCommand>
{
    public ResetPasswordCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Địa chỉ email không được để trống.")
            .EmailAddress().WithMessage("Địa chỉ email không đúng định dạng.");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Mã OTP không được để trống.")
            .Length(6).WithMessage("Mã OTP phải gồm đúng 6 chữ số.");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("Mật khẩu mới không được để trống.")
            .MinimumLength(6).WithMessage("Mật khẩu mới phải chứa ít nhất 6 ký tự.");
    }
}
