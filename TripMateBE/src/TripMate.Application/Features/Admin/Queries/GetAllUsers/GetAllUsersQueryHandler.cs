using MediatR;
using TripMate.Application.DTOs.Users;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Admin.Queries.GetAllUsers;

/// <summary>
/// Handler xử lý lấy danh sách toàn bộ thành viên trong CSDL
/// </summary>
public class GetAllUsersQueryHandler : IRequestHandler<GetAllUsersQuery, List<UserProfileResponseDto>>
{
    private readonly IUserRepository _userRepository;

    public GetAllUsersQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<List<UserProfileResponseDto>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
    {
        var users = await _userRepository.GetAllUsersAsync(cancellationToken);

        return users.Select(u => new UserProfileResponseDto
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
            IdentityCardFrontUrl = u.IdentityCardFrontUrl,
            IdentityCardBackUrl = u.IdentityCardBackUrl,
            IdentityCardNumber = u.IdentityCardNumber,
            HostVerificationStatus = u.HostVerificationStatus,
            AvgRating = u.AvgRating,
            TotalReviews = u.TotalReviews,
            TotalTrips = (u.OrganizedTrips?.Count ?? 0) + (u.JoinedTrips?.Count ?? 0)
        }).ToList();
    }
}
