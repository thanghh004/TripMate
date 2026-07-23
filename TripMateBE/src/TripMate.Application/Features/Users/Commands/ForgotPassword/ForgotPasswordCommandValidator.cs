using FluentValidation;

namespace TripMate.Application.Features.Users.Commands.ForgotPassword;

/// <summary>
/// Trình kiểm tra hợp lệ dữ liệu gửi yêu cầu quên mật khẩu
/// </summary>
public class ForgotPasswordCommandValidator : AbstractValidator<ForgotPasswordCommand>
{
    public ForgotPasswordCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Địa chỉ email không được để trống.")
            .EmailAddress().WithMessage("Địa chỉ email không đúng định dạng.");
    }
}
