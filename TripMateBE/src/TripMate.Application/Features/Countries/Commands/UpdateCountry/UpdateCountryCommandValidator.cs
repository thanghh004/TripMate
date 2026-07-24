using FluentValidation;

namespace TripMate.Application.Features.Countries.Commands.UpdateCountry;

public class UpdateCountryCommandValidator : AbstractValidator<UpdateCountryCommand>
{
    public UpdateCountryCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("ID quốc gia không được để trống.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên quốc gia không được để trống.")
            .MaximumLength(100).WithMessage("Tên quốc gia không được vượt quá 100 ký tự.");

        RuleFor(x => x.Code)
            .MaximumLength(10).WithMessage("Mã quốc gia không được vượt quá 10 ký tự.");
    }
}
