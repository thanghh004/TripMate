using FluentValidation;

namespace TripMate.Application.Features.Trips.Commands.RejectTripMember;

public class RejectTripMemberCommandValidator : AbstractValidator<RejectTripMemberCommand>
{
    public RejectTripMemberCommandValidator()
    {
        RuleFor(x => x.TripId)
            .NotEmpty().WithMessage("ID chuyến đi không được để trống.");

        RuleFor(x => x.MemberUserId)
            .NotEmpty().WithMessage("ID thành viên không được để trống.");

        RuleFor(x => x.OrganizerId)
            .NotEmpty().WithMessage("ID trưởng đoàn không được để trống.");
    }
}
