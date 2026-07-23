using MediatR;
using TripMate.Application.DTOs.Users;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Users.Queries.GetMyProfile;

/// <summary>
/// Handler xử lý truy vấn lấy hồ sơ cá nhân đầy đủ từ cơ sở dữ liệu
/// </summary>
public class GetMyProfileQueryHandler : IRequestHandler<GetMyProfileQuery, UserProfileResponseDto>
{
    private readonly IUserRepository _userRepository;

    public GetMyProfileQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserProfileResponseDto> Handle(GetMyProfileQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetProfileByIdAsync(request.UserId, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException("Không tìm thấy thông tin tài khoản người dùng.");
        }

        var totalTrips = (user.OrganizedTrips?.Count ?? 0) + (user.JoinedTrips?.Count ?? 0);

        return new UserProfileResponseDto
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
            IdentityCardFrontUrl = user.IdentityCardFrontUrl,
            IdentityCardBackUrl = user.IdentityCardBackUrl,
            AvgRating = user.AvgRating,
            TotalReviews = user.TotalReviews,
            TotalTrips = totalTrips
        };
    }
}
