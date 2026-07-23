using MediatR;

namespace TripMate.Application.Features.Admin.Commands.ToggleUserStatus;

/// <summary>
/// Command đảo trạng thái Khóa / Mở khóa tài khoản người dùng
/// </summary>
public record ToggleUserStatusCommand(Guid UserId) : IRequest<bool>;
