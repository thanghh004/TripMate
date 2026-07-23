using MediatR;
using TripMate.Application.DTOs.Auth;

namespace TripMate.Application.Features.Users.Commands.Register;

/// <summary>
/// Command đăng ký tài khoản người dùng mới bằng Email
/// </summary>
public record RegisterCommand(
    string FullName, 
    string Email, 
    string? PhoneNumber, 
    string Password
) : IRequest<RegisterResponseDto>;
