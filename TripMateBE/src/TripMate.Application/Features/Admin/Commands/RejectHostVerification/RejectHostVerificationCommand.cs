using MediatR;

namespace TripMate.Application.Features.Admin.Commands.RejectHostVerification;

/// <summary>
/// Command Admin từ chối yêu cầu duyệt quyền Host của người dùng (kèm lý do)
/// </summary>
public record RejectHostVerificationCommand(
    Guid UserId,
    string? Reason
) : IRequest<bool>;
