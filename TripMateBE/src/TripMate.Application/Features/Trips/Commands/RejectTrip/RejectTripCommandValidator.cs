using FluentValidation;

namespace TripMate.Application.Features.Trips.Commands.RejectTrip;

public class RejectTripCommandValidator : AbstractValidator<RejectTripCommand>
{
    public RejectTripCommandValidator()
    {
        RuleFor(x => x.Dto.Reason)
            .NotEmpty().WithMessage("Lý do từ chối chuyến đi không được để trống.")
            .MaximumLength(500).WithMessage("Lý do từ chối không được vượt quá 500 ký tự.");
    }
}
