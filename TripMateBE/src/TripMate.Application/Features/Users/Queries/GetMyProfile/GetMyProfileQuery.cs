using MediatR;
using TripMate.Application.DTOs.Users;

namespace TripMate.Application.Features.Users.Queries.GetMyProfile;

/// <summary>
/// Query lấy thông tin hồ sơ đầy đủ của người dùng hiện tại
/// </summary>
public record GetMyProfileQuery(Guid UserId) : IRequest<UserProfileResponseDto>;
