using MediatR;
using TripMate.Application.DTOs.Admin;

namespace TripMate.Application.Features.Admin.Queries.GetPendingHostVerifications;

/// <summary>
/// Query lấy danh sách toàn bộ các yêu cầu duyệt quyền Host đang ở trạng thái Pending
/// </summary>
public record GetPendingHostVerificationsQuery : IRequest<List<PendingHostVerificationDto>>;
