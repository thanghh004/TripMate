using MediatR;
using TripMate.Application.DTOs.Users;

namespace TripMate.Application.Features.Admin.Queries.GetAllUsers;

/// <summary>
/// Query lấy danh sách toàn bộ người dùng trong CSDL cho Admin
/// </summary>
public record GetAllUsersQuery : IRequest<List<UserProfileResponseDto>>;
