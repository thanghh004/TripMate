using MediatR;
using TripMate.Application.DTOs.Admin;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Admin.Queries.GetPendingHostVerifications;

/// <summary>
/// Handler xử lý truy vấn danh sách yêu cầu xác thực Host đang chờ duyệt
/// </summary>
public class GetPendingHostVerificationsQueryHandler : IRequestHandler<GetPendingHostVerificationsQuery, List<PendingHostVerificationDto>>
{
    private readonly IUserRepository _userRepository;

    public GetPendingHostVerificationsQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<List<PendingHostVerificationDto>> Handle(GetPendingHostVerificationsQuery request, CancellationToken cancellationToken)
    {
        var users = await _userRepository.GetPendingHostVerificationsAsync(cancellationToken);

        return users.Select(u => new PendingHostVerificationDto
        {
            UserId = u.Id,
            FullName = u.FullName,
            Email = u.Email!,
            PhoneNumber = u.PhoneNumber,
            Gender = u.Gender,
            BirthDate = u.BirthDate,
            AvatarUrl = u.AvatarUrl,
            Bio = u.Bio,
            IdentityCardNumber = u.IdentityCardNumber,
            IdentityCardFrontUrl = u.IdentityCardFrontUrl,
            IdentityCardBackUrl = u.IdentityCardBackUrl,
            HostVerificationStatus = u.HostVerificationStatus,
            AvgRating = u.AvgRating,
            TotalTrips = (u.OrganizedTrips?.Count ?? 0) + (u.JoinedTrips?.Count ?? 0),
            RequestDate = u.UpdatedAt != default ? u.UpdatedAt : u.CreatedAt
        }).ToList();
    }
}
