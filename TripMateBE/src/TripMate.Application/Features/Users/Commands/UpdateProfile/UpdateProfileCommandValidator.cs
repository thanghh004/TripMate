using FluentValidation;

namespace TripMate.Application.Features.Users.Commands.UpdateProfile;

/// <summary>
/// Trình kiểm tra hợp lệ dữ liệu yêu cầu cập nhật thông tin cá nhân
/// </summary>
public class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileCommandValidator()
    {
        // Họ tên: bắt buộc, độ dài hợp lệ
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Họ tên không được để trống.")
            .MinimumLength(2).WithMessage("Họ tên phải chứa ít nhất 2 ký tự.")
            .MaximumLength(100).WithMessage("Họ tên tối đa 100 ký tự.");

        // Số điện thoại: định dạng Việt Nam nếu được cung cấp
        RuleFor(x => x.PhoneNumber)
            .Matches(@"^(0[3|5|7|8|9])+([0-9]{8})$")
            .WithMessage("Số điện thoại không đúng định dạng của Việt Nam (10 số, bắt đầu bằng 03/05/07/08/09).")
            .When(x => !string.IsNullOrEmpty(x.PhoneNumber));

        // Tiểu sử: giới hạn độ dài tối đa
        RuleFor(x => x.Bio)
            .MaximumLength(500).WithMessage("Tiểu sử cá nhân tối đa 500 ký tự.")
            .When(x => !string.IsNullOrEmpty(x.Bio));

        // Ảnh đại diện: phải là URL hợp lệ nếu được cung cấp
        RuleFor(x => x.AvatarUrl)
            .Must(url => Uri.TryCreate(url, UriKind.Absolute, out _))
            .WithMessage("Đường dẫn ảnh đại diện không hợp lệ.")
            .When(x => !string.IsNullOrEmpty(x.AvatarUrl));

        // CCCD mặt trước: phải là URL hợp lệ nếu được cung cấp
        RuleFor(x => x.IdentityCardFrontUrl)
            .Must(url => Uri.TryCreate(url, UriKind.Absolute, out _))
            .WithMessage("Đường dẫn ảnh CCCD mặt trước không hợp lệ.")
            .When(x => !string.IsNullOrEmpty(x.IdentityCardFrontUrl));

        // CCCD mặt sau: phải là URL hợp lệ nếu được cung cấp
        RuleFor(x => x.IdentityCardBackUrl)
            .Must(url => Uri.TryCreate(url, UriKind.Absolute, out _))
            .WithMessage("Đường dẫn ảnh CCCD mặt sau không hợp lệ.")
            .When(x => !string.IsNullOrEmpty(x.IdentityCardBackUrl));

        // Số CCCD: phải là chuỗi 12 chữ số nếu được cung cấp
        RuleFor(x => x.IdentityCardNumber)
            .Matches(@"^[0-9]{12}$")
            .WithMessage("Số CCCD không hợp lệ (phải gồm đúng 12 chữ số).")
            .When(x => !string.IsNullOrEmpty(x.IdentityCardNumber));
    }
}
