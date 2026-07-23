using MediatR;
using TripMate.Application.DTOs.Admin;

namespace TripMate.Application.Features.Admin.Queries.GetAllUsers;

/// <summary>
/// Query lấy danh sách toàn bộ người dùng trong CSDL cho Admin
/// </summary>
public record GetAllUsersQuery : IRequest<List<AdminUserListItemDto>>;
