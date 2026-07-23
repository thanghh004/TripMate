using MediatR;
using TripMate.Application.DTOs.Auth;
using TripMate.Domain.Entities;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Users.Commands.GoogleLogin;

/// <summary>
/// Handler xử lý xác thực Google ID Token và trả về Access Token + Refresh Token
/// </summary>
public class GoogleLoginCommandHandler : IRequestHandler<GoogleLoginCommand, GoogleLoginResponseDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IGoogleAuthService _googleAuthService;
    private readonly ITokenService _tokenService;

    public GoogleLoginCommandHandler(
        IUserRepository userRepository, 
        IGoogleAuthService googleAuthService, 
        ITokenService tokenService)
    {
        _userRepository = userRepository;
        _googleAuthService = googleAuthService;
        _tokenService = tokenService;
    }

    public async Task<GoogleLoginResponseDto> Handle(GoogleLoginCommand request, CancellationToken cancellationToken)
    {
        // 1. Xác minh mã ID Token với Google API
        var googleUser = await _googleAuthService.ValidateIdTokenAsync(request.IdToken);
        var email = googleUser.Email.Trim().ToLower();

        // 2. Tìm kiếm thông tin người dùng trong CSDL
        var user = await _userRepository.GetByEmailAsync(email, cancellationToken);

        if (user == null)
        {
            // 3. Nếu chưa có tài khoản, khởi tạo tài khoản mới từ thông tin Google
            user = new User
            {
                FullName = string.IsNullOrWhiteSpace(googleUser.Name) ? "Người dùng Google" : googleUser.Name.Trim(),
                Email = email,
                UserName = email,
                AvatarUrl = googleUser.Picture,
                EmailConfirmed = true, // Email từ Google mặc định đã được xác minh
                Status = Domain.Enums.UserStatus.Active
            };

            // Sinh mật khẩu ngẫu nhiên bảo mật để đáp ứng Identity
            var randomPassword = "Google_" + Guid.NewGuid().ToString("N") + "1!";
            var createResult = await _userRepository.CreateAsync(user, randomPassword);

            if (!createResult.Succeeded)
            {
                var errors = createResult.Errors.Select(e => e.Description).ToArray();
                throw new BusinessRuleException($"Khởi tạo tài khoản từ Google thất bại: {string.Join(" ", errors)}");
            }
        }
        else
        {
            // 4. Nếu tài khoản đã tồn tại, tự động cập nhật EmailConfirmed thành true nếu chưa xác minh
            var isUpdated = false;
            if (!user.EmailConfirmed)
            {
                user.EmailConfirmed = true;
                isUpdated = true;
            }

            if (string.IsNullOrEmpty(user.AvatarUrl) && !string.IsNullOrEmpty(googleUser.Picture))
            {
                user.AvatarUrl = googleUser.Picture;
                isUpdated = true;
            }

            if (isUpdated)
            {
                await _userRepository.UpdateAsync(user);
            }
        }

        // 5. Sinh Access Token và Refresh Token cho người dùng
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();

        // 6. Cập nhật mã Refresh Token xuống CSDL (hạn 7 ngày)
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);

        // 7. Trả về kết quả xác thực dưới dạng GoogleLoginResponseDto
        return new GoogleLoginResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresIn = 86400,
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email!,
            Role = user.Role.ToString(),
            AvatarUrl = user.AvatarUrl
        };
    }
}
