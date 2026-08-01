using FluentValidation;

namespace TripMate.Application.Features.Trips.Commands.RejectTrip;

public class RejectTripCommandValidator : AbstractValidator<RejectTripCommand>
{
    public RejectTripCommandValidator()
    {
        RuleFor(x => x.TripId)
            .NotEmpty().WithMessage("ID chuyến đi không được để trống.");

        RuleFor(x => x.Dto.Reason)
            .NotEmpty().WithMessage("Vui lòng cung cấp lý do từ chối chuyến đi.")
            .MaximumLength(500).WithMessage("Lý do từ chối không được vượt quá 500 ký tự.");
    }
}
