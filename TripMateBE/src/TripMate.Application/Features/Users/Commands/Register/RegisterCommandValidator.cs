using FluentValidation;

namespace TripMate.Application.Features.Users.Commands.Register;

/// <summary>
/// Trình kiểm tra hợp lệ dữ liệu đăng ký bằng Email
/// </summary>
public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Họ tên không được để trống.")
            .MinimumLength(2).WithMessage("Họ tên phải chứa ít nhất 2 ký tự.")
            .MaximumLength(100).WithMessage("Họ tên tối đa 100 ký tự.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Địa chỉ email không được để trống.")
            .EmailAddress().WithMessage("Địa chỉ email không đúng định dạng.")
            .MaximumLength(255).WithMessage("Email tối đa 255 ký tự.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Mật khẩu không được để trống.")
            .MinimumLength(6).WithMessage("Mật khẩu phải chứa ít nhất 6 ký tự.");
    }
}
