using FluentValidation;

namespace TripMate.Application.Features.Trips.Commands.UpdateTrip;

public class UpdateTripCommandValidator : AbstractValidator<UpdateTripCommand>
{
    public UpdateTripCommandValidator()
    {
        RuleFor(x => x.Dto.Title)
            .NotEmpty().WithMessage("Tiêu đề chuyến đi không được để trống.")
            .MaximumLength(200).WithMessage("Tiêu đề chuyến đi không được vượt quá 200 ký tự.");

        RuleFor(x => x.Dto.CategoryId)
            .NotEmpty().WithMessage("Vui lòng chọn danh mục loại hình chuyến đi.");

        RuleFor(x => x.Dto.StartLocation)
            .NotEmpty().WithMessage("Điểm khởi hành cụ thể không được để trống.");

        RuleFor(x => x.Dto.Destination)
            .NotEmpty().WithMessage("Điểm đến chính cụ thể không được để trống.");

        RuleFor(x => x.Dto.Description)
            .NotEmpty().WithMessage("Mô tả & Kế hoạch chi tiết không được để trống.");

        RuleFor(x => x.Dto.CoverImageUrl)
            .NotEmpty().WithMessage("Vui lòng tải lên hoặc nhập URL Ảnh bìa chính cho chuyến đi.");

        RuleFor(x => x.Dto.StartDate)
            .NotEmpty().WithMessage("Ngày khởi hành không được để trống.");

        RuleFor(x => x.Dto.EndDate)
            .GreaterThanOrEqualTo(x => x.Dto.StartDate).WithMessage("Ngày kết thúc phải trùng hoặc sau ngày khởi hành.");

        RuleFor(x => x.Dto.MaxMembers)
            .GreaterThan(0).WithMessage("Số lượng thành viên tối đa phải lớn hơn 0.");

        RuleFor(x => x.Dto.EstimatedCost)
            .GreaterThanOrEqualTo(0)
            .When(x => x.Dto.EstimatedCost.HasValue)
            .WithMessage("Chi phí ước tính phải lớn hơn hoặc bằng 0.");

        RuleFor(x => x.Dto.MaxAge)
            .GreaterThanOrEqualTo(x => x.Dto.MinAge!.Value)
            .When(x => x.Dto.MinAge.HasValue && x.Dto.MaxAge.HasValue)
            .WithMessage("Độ tuổi tối đa phải lớn hơn hoặc bằng độ tuổi tối thiểu.");
    }
}
