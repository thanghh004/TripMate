using MediatR;
using TripMate.Application.DTOs.Auth;

namespace TripMate.Application.Features.Users.Commands.Login;

/// <summary>
/// Command đăng nhập vào hệ thống bằng Email và Mật khẩu
/// </summary>
public record LoginCommand(
    string Email, 
    string Password
) : IRequest<LoginResponseDto>;
