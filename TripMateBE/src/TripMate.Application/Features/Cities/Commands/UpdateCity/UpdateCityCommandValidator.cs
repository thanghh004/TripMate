using FluentValidation;

namespace TripMate.Application.Features.Cities.Commands.UpdateCity;

public class UpdateCityCommandValidator : AbstractValidator<UpdateCityCommand>
{
    public UpdateCityCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("ID thành phố không được để trống.");

        RuleFor(x => x.CountryId)
            .NotEmpty().WithMessage("ID Quốc gia không được để trống.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên thành phố / tỉnh không được để trống.")
            .MaximumLength(100).WithMessage("Tên thành phố / tỉnh không được vượt quá 100 ký tự.");
    }
}
