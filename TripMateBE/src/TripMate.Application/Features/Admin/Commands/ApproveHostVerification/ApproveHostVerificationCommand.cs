using MediatR;

namespace TripMate.Application.Features.Admin.Commands.ApproveHostVerification;

/// <summary>
/// Command Admin phê duyệt yêu cầu duyệt quyền Host của người dùng
/// </summary>
public record ApproveHostVerificationCommand(Guid UserId) : IRequest<bool>;
