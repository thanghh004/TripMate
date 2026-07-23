using MediatR;
using TripMate.Application.DTOs.Auth;

namespace TripMate.Application.Features.Users.Commands.RefreshToken;

/// <summary>
/// Command cấp lại Access Token bằng mã Refresh Token
/// </summary>
public record RefreshTokenCommand(
    string AccessToken, 
    string RefreshToken
) : IRequest<RefreshTokenResponseDto>;
