using System.Security.Claims;
using MediatR;
using TripMate.Application.DTOs.Auth;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Users.Commands.RefreshToken;

/// <summary>
/// Handler xử lý làm mới mã Access Token
/// </summary>
public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, RefreshTokenDto>
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;

    public RefreshTokenCommandHandler(IUserRepository userRepository, ITokenService tokenService)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
    }

    public async Task<RefreshTokenDto> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        // 1. Trích xuất Claims từ Access Token đã hết hạn
        var principal = _tokenService.GetPrincipalFromExpiredToken(request.AccessToken);
        if (principal == null)
        {
            throw new UnauthorizedException("Access Token không hợp lệ.");
        }

        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedException("Thông tin người dùng trong Token không hợp lệ.");
        }

        // 2. Kiểm tra thông tin người dùng trong CSDL (so sánh chuỗi Refresh Token đã băm SHA-256)
        var hashedRefreshToken = _tokenService.HashToken(request.RefreshToken);
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user == null || user.RefreshToken != hashedRefreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            throw new UnauthorizedException("Refresh Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
        }

        // 3. Sinh Access Token mới và Refresh Token mới
        var newAccessToken = _tokenService.GenerateAccessToken(user);
        var newRefreshToken = _tokenService.GenerateRefreshToken();

        // 4. Cập nhật mã Refresh Token băm mới vào CSDL
        user.RefreshToken = _tokenService.HashToken(newRefreshToken);
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);

        // 5. Trả về kết quả dưới dạng RefreshTokenDto với Refresh Token nguyên bản
        return new RefreshTokenDto
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
            ExpiresIn = _tokenService.GetAccessTokenExpirySeconds(),
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email!,
            Role = user.Role.ToString(),
            AvatarUrl = user.AvatarUrl
        };
    }
}
