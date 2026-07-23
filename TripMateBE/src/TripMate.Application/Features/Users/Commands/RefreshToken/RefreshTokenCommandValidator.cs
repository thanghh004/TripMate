using FluentValidation;

namespace TripMate.Application.Features.Users.Commands.RefreshToken;

/// <summary>
/// Trình kiểm tra hợp lệ dữ liệu làm mới Token
/// </summary>
public class RefreshTokenCommandValidator : AbstractValidator<RefreshTokenCommand>
{
    public RefreshTokenCommandValidator()
    {
        RuleFor(x => x.AccessToken)
            .NotEmpty().WithMessage("Access Token không được để trống.");

        RuleFor(x => x.RefreshToken)
            .NotEmpty().WithMessage("Refresh Token không được để trống.");
    }
}
