using FluentValidation;

namespace TripMate.Application.Features.Trips.Commands.UpdateTrip;

public class UpdateTripCommandValidator : AbstractValidator<UpdateTripCommand>
{
    public UpdateTripCommandValidator()
    {
        RuleFor(x => x.Dto.Title)
            .NotEmpty().WithMessage("Tiêu đề chuyến đi không được để trống.")
            .MaximumLength(200).WithMessage("Tiêu đề chuyến đi không được vượt quá 200 ký tự.");

        RuleFor(x => x.Dto.StartLocation)
            .NotEmpty().WithMessage("Điểm khởi hành cụ thể không được để trống.");

        RuleFor(x => x.Dto.Destination)
            .NotEmpty().WithMessage("Điểm đến chính cụ thể không được để trống.");

        RuleFor(x => x.Dto.StartDate)
            .GreaterThanOrEqualTo(DateTime.UtcNow.Date.AddDays(7))
            .WithMessage("Ngày khởi hành phải cách thời điểm hiện tại ít nhất 7 ngày để chuẩn bị và duyệt chuyến.");

        RuleFor(x => x.Dto.EndDate)
            .GreaterThanOrEqualTo(x => x.Dto.StartDate).WithMessage("Ngày kết thúc phải trùng hoặc sau ngày khởi hành.");

        RuleFor(x => x.Dto.MaxMembers)
            .GreaterThan(0).WithMessage("Số lượng thành viên tối đa phải lớn hơn 0.");

        RuleFor(x => x.Dto.EstimatedCost)
            .NotNull().WithMessage("Chi phí ước tính không được để trống.")
            .GreaterThanOrEqualTo(0).WithMessage("Chi phí ước tính phải lớn hơn hoặc bằng 0.");

        RuleFor(x => x.Dto.CostNote)
            .NotEmpty().WithMessage("Ghi chú chi phí không được để trống.");

        RuleFor(x => x.Dto.MaxAge)
            .GreaterThanOrEqualTo(x => x.Dto.MinAge!.Value)
            .When(x => x.Dto.MinAge.HasValue && x.Dto.MaxAge.HasValue)
            .WithMessage("Độ tuổi tối đa phải lớn hơn hoặc bằng độ tuổi tối thiểu.");
    }
}
