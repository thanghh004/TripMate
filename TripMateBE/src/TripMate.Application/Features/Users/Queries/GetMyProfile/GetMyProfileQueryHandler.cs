using MediatR;
using TripMate.Application.DTOs.Users;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Users.Queries.GetMyProfile;

/// <summary>
/// Handler xử lý truy vấn lấy hồ sơ cá nhân đầy đủ từ cơ sở dữ liệu
/// </summary>
public class GetMyProfileQueryHandler : IRequestHandler<GetMyProfileQuery, UserProfileDto>
{
    private readonly IUserRepository _userRepository;

    public GetMyProfileQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserProfileDto> Handle(GetMyProfileQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetProfileByIdAsync(request.UserId, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException("Không tìm thấy thông tin tài khoản người dùng.");
        }

        var totalTrips = (user.OrganizedTrips?.Count ?? 0) + (user.JoinedTrips?.Count ?? 0);
        var hasActiveTrips = await _userRepository.HasActiveTripsAsync(user.Id, cancellationToken);

        return new UserProfileDto
        {
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email!,
            PhoneNumber = user.PhoneNumber,
            Gender = user.Gender,
            BirthDate = user.BirthDate,
            AvatarUrl = user.AvatarUrl,
            Bio = user.Bio,
            Role = user.Role.ToString(),
            Status = user.Status,
            IdentityCardFrontUrl = user.IdentityCardFrontUrl,
            IdentityCardBackUrl = user.IdentityCardBackUrl,
            IdentityCardNumber = user.IdentityCardNumber,
            HostVerificationStatus = user.HostVerificationStatus,
            HostRejectReason = user.HostRejectReason,
            AvgRating = user.AvgRating,
            TotalReviews = user.TotalReviews,
            TotalTrips = totalTrips,
            CreatedCompletedTripsCount = user.OrganizedTrips?.Count(t => t.Status == TripMate.Domain.Enums.TripStatus.Completed) ?? 0,
            CreatedUncompletedTripsCount = user.OrganizedTrips?.Count(t => 
                t.Status == TripMate.Domain.Enums.TripStatus.Cancelled || 
                t.Status == TripMate.Domain.Enums.TripStatus.Rejected || 
                t.Status == TripMate.Domain.Enums.TripStatus.Failed) ?? 0,
            JoinedCompletedTripsCount = user.JoinedTrips?.Count(m => m.Trip != null && m.Trip.Status == TripMate.Domain.Enums.TripStatus.Completed) ?? 0,
            JoinedUncompletedTripsCount = user.JoinedTrips?.Count(m => m.Trip != null && (
                m.Trip.Status == TripMate.Domain.Enums.TripStatus.Cancelled || 
                m.Trip.Status == TripMate.Domain.Enums.TripStatus.Rejected || 
                m.Trip.Status == TripMate.Domain.Enums.TripStatus.Failed)) ?? 0,
            HasActiveTrips = hasActiveTrips
        };
    }
}

