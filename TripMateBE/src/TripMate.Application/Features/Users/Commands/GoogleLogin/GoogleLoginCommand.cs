using MediatR;
using TripMate.Application.DTOs.Auth;

namespace TripMate.Application.Features.Users.Commands.GoogleLogin;

/// <summary>
/// Command đăng nhập hệ thống bằng Google ID Token
/// </summary>
public record GoogleLoginCommand(
    string IdToken
) : IRequest<GoogleLoginResponseDto>;
