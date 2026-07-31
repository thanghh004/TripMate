using MediatR;
using TripMate.Application.DTOs.Admin;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Admin.Queries.GetAllUsers;

/// <summary>
/// Handler xử lý lấy danh sách toàn bộ thành viên trong CSDL.
/// Chỉ map đúng các trường cần thiết vào AdminUserListItemDto —
/// không expose trường nhạy cảm hay trường thừa (AvgRating, TotalReviews...).
/// </summary>
public class GetAllUsersQueryHandler : IRequestHandler<GetAllUsersQuery, List<AdminUserListItemDto>>
{
    private readonly IUserRepository _userRepository;

    public GetAllUsersQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<List<AdminUserListItemDto>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
    {
        var users = await _userRepository.GetAllUsersAsync(cancellationToken);

        return users.Select(u => new AdminUserListItemDto
        {
            UserId = u.Id,
            FullName = u.FullName,
            Email = u.Email!,
            PhoneNumber = u.PhoneNumber,
            Gender = u.Gender,
            BirthDate = u.BirthDate,
            AvatarUrl = u.AvatarUrl,
            Bio = u.Bio,
            Role = u.Role.ToString(),
            Status = u.Status,
            IdentityCardNumber = u.IdentityCardNumber,
            IdentityCardFrontUrl = u.IdentityCardFrontUrl,
            IdentityCardBackUrl = u.IdentityCardBackUrl,
            HostVerificationStatus = u.HostVerificationStatus,
            AvgRating = u.AvgRating,
            TotalTrips = (u.OrganizedTrips?.Count ?? 0) + (u.JoinedTrips?.Count ?? 0),
            CreatedTotalTripsCount = u.OrganizedTrips?.Count ?? 0,
            CreatedCompletedTripsCount = u.OrganizedTrips?.Count(t => t.Status == TripMate.Domain.Enums.TripStatus.Completed) ?? 0,
            CreatedUncompletedTripsCount = u.OrganizedTrips?.Count(t => 
                t.Status == TripMate.Domain.Enums.TripStatus.Cancelled || 
                t.Status == TripMate.Domain.Enums.TripStatus.Rejected || 
                t.Status == TripMate.Domain.Enums.TripStatus.Failed) ?? 0,
            JoinedCompletedTripsCount = u.JoinedTrips?.Count(m => m.Trip != null && m.Trip.Status == TripMate.Domain.Enums.TripStatus.Completed) ?? 0,
            JoinedUncompletedTripsCount = u.JoinedTrips?.Count(m => m.Trip != null && (
                m.Trip.Status == TripMate.Domain.Enums.TripStatus.Cancelled || 
                m.Trip.Status == TripMate.Domain.Enums.TripStatus.Rejected || 
                m.Trip.Status == TripMate.Domain.Enums.TripStatus.Failed)) ?? 0,
        }).ToList();
    }
}


