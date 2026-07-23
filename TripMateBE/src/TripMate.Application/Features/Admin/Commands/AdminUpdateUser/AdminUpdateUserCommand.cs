using MediatR;
using TripMate.Domain.Enums;

namespace TripMate.Application.Features.Admin.Commands.AdminUpdateUser;

/// <summary>
/// Command cho phép Admin cập nhật Vai trò, Trạng thái tài khoản và Quyền duyệt Host
/// (Không cho phép chỉnh sửa thông tin cá nhân như Họ tên, SĐT, Giới tính, Ngày sinh)
/// </summary>
public record AdminUpdateUserCommand(
    Guid UserId,
    UserRole Role,
    UserStatus Status,
    HostVerificationStatus HostVerificationStatus
) : IRequest<bool>;
