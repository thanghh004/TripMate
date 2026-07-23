using FluentValidation;

namespace TripMate.Application.Features.Users.Commands.RequestHostVerification;

/// <summary>
/// Trình kiểm tra hợp lệ dữ liệu yêu cầu gửi duyệt quyền tạo chuyến
/// </summary>
public class RequestHostVerificationCommandValidator : AbstractValidator<RequestHostVerificationCommand>
{
    public RequestHostVerificationCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("Mã người dùng không hợp lệ.");
    }
}
