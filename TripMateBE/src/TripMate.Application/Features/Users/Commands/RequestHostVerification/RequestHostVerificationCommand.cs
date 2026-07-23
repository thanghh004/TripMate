using MediatR;

namespace TripMate.Application.Features.Users.Commands.RequestHostVerification;

/// <summary>
/// Command gửi yêu cầu duyệt quyền tạo chuyến/tổ chức chuyến đi
/// </summary>
public record RequestHostVerificationCommand(Guid UserId) : IRequest<bool>;
