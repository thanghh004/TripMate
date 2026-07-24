using FluentValidation;

namespace TripMate.Application.Features.TripCategories.Commands.UpdateTripCategory;

public class UpdateTripCategoryCommandValidator : AbstractValidator<UpdateTripCategoryCommand>
{
    public UpdateTripCategoryCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("ID loại chuyến đi không hợp lệ.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên loại chuyến đi không được để trống.")
            .MaximumLength(100).WithMessage("Tên loại chuyến đi không được vượt quá 100 ký tự.");

        RuleFor(x => x.Slug)
            .NotEmpty().WithMessage("Slug không được để trống.")
            .MaximumLength(120).WithMessage("Slug không được vượt quá 120 ký tự.")
            .Matches("^[a-z0-9]+(?:-[a-z0-9]+)*$").WithMessage("Slug chỉ được chứa chữ thường, số và dấu gạch ngang.");

        RuleFor(x => x.Icon)
            .MaximumLength(255).WithMessage("Icon không được vượt quá 255 ký tự.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Mô tả không được vượt quá 500 ký tự.");
    }
}
