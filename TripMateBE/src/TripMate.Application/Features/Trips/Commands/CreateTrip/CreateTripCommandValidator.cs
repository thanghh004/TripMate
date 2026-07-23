using FluentValidation;

namespace TripMate.Application.Features.Trips.Commands.CreateTrip;

/// <summary>
/// Trình kiểm tra hợp lệ dữ liệu đầu vào cho yêu cầu tạo chuyến đi mới
/// </summary>
public class CreateTripCommandValidator : AbstractValidator<CreateTripCommand>
{
    public CreateTripCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("Mã người dùng không hợp lệ.");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Tiêu đề chuyến đi không được để trống.")
            .MaximumLength(200).WithMessage("Tiêu đề chuyến đi không được vượt quá 200 ký tự.");

        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Mô tả chuyến đi không được vượt quá 2000 ký tự.");
    }
}
