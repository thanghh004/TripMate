using MediatR;
using TripMate.Domain.Enums;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Users.Commands.RequestHostVerification;

/// <summary>
/// Handler xử lý gửi yêu cầu duyệt quyền tạo chuyến đi của người dùng
/// </summary>
public class RequestHostVerificationCommandHandler : IRequestHandler<RequestHostVerificationCommand, bool>
{
    private readonly IUserRepository _userRepository;

    public RequestHostVerificationCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<bool> Handle(RequestHostVerificationCommand request, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra tài khoản người dùng
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException("Không tìm thấy thông tin tài khoản người dùng.");
        }

        // 2. Kiểm tra trạng thái hiện tại
        if (user.HostVerificationStatus == HostVerificationStatus.Pending)
        {
            throw new BusinessRuleException("Yêu cầu của bạn đã được gửi và đang trong quá trình chờ Admin xét duyệt.");
        }

        if (user.HostVerificationStatus == HostVerificationStatus.Approved)
        {
            throw new BusinessRuleException("Tài khoản của bạn đã được phê duyệt quyền tạo chuyến từ trước.");
        }

        // 3. Kiểm tra đầy đủ 7 thông tin bắt buộc
        var missingFields = new List<string>();

        if (string.IsNullOrWhiteSpace(user.FullName)) missingFields.Add("Họ và tên");
        if (!user.BirthDate.HasValue) missingFields.Add("Ngày sinh");
        if (string.IsNullOrWhiteSpace(user.Gender)) missingFields.Add("Giới tính");
        if (string.IsNullOrWhiteSpace(user.PhoneNumber)) missingFields.Add("Số điện thoại");
        if (string.IsNullOrWhiteSpace(user.IdentityCardNumber)) missingFields.Add("Số CCCD");
        if (string.IsNullOrWhiteSpace(user.IdentityCardFrontUrl)) missingFields.Add("Ảnh CCCD mặt trước");
        if (string.IsNullOrWhiteSpace(user.IdentityCardBackUrl)) missingFields.Add("Ảnh CCCD mặt sau");

        if (missingFields.Count > 0)
        {
            var fieldList = string.Join(", ", missingFields);
            throw new BusinessRuleException($"Vui lòng bổ sung đầy đủ các thông tin bắt buộc sau trước khi gửi yêu cầu duyệt: {fieldList}.");
        }

        // 4. Đổi trạng thái sang Pending (Chờ duyệt)
        user.HostVerificationStatus = HostVerificationStatus.Pending;
        user.UpdatedAt = DateTime.UtcNow;

        var result = await _userRepository.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(" ", result.Errors.Select(e => e.Description));
            throw new BusinessRuleException($"Gửi yêu cầu thất bại: {errors}");
        }

        return true;
    }
}
