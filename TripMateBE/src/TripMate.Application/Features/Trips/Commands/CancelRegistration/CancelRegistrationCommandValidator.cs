using FluentValidation;

namespace TripMate.Application.Features.Trips.Commands.CancelRegistration;

public class CancelRegistrationCommandValidator : AbstractValidator<CancelRegistrationCommand>
{
    public CancelRegistrationCommandValidator()
    {
        RuleFor(x => x.TripId)
            .NotEmpty().WithMessage("ID chuyến đi không được để trống.");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("ID người dùng không được để trống.");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Vui lòng cung cấp lý do hủy đăng ký tham gia chuyến đi.")
            .MaximumLength(500).WithMessage("Lý do hủy không được vượt quá 500 ký tự.");
    }
}
