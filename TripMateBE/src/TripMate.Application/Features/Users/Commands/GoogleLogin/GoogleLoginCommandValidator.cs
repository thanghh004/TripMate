using FluentValidation;

namespace TripMate.Application.Features.Users.Commands.GoogleLogin;

/// <summary>
/// Trình kiểm tra hợp lệ dữ liệu đăng nhập Google
/// </summary>
public class GoogleLoginCommandValidator : AbstractValidator<GoogleLoginCommand>
{
    public GoogleLoginCommandValidator()
    {
        RuleFor(x => x.IdToken)
            .NotEmpty().WithMessage("Google ID Token không được để trống.");
    }
}
