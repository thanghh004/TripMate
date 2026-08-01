using FluentValidation;

namespace TripMate.Application.Features.Trips.Commands.CancelTrip;

public class CancelTripCommandValidator : AbstractValidator<CancelTripCommand>
{
    public CancelTripCommandValidator()
    {
        RuleFor(x => x.TripId)
            .NotEmpty().WithMessage("ID chuyến đi không được để trống.");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Vui lòng nhập lý do hủy chuyến đi.")
            .MaximumLength(500).WithMessage("Lý do hủy không được vượt quá 500 ký tự.");
    }
}
