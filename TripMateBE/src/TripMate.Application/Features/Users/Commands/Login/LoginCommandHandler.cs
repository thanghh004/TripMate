using MediatR;
using TripMate.Application.DTOs.Auth;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Users.Commands.Login;

/// <summary>
/// Handler xử lý đăng nhập và cấp phát mã Token JWT + Refresh Token
/// </summary>
public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResponseDto>
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;

    public LoginCommandHandler(IUserRepository userRepository, ITokenService tokenService)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
    }

    public async Task<LoginResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLower();

        // 1. Tìm kiếm người dùng bằng Email
        var user = await _userRepository.GetByEmailAsync(email, cancellationToken);
        if (user == null)
        {
            throw new UnauthorizedException("Địa chỉ Email hoặc Mật khẩu không chính xác.");
        }

        // 2. Kiểm tra mật khẩu có khớp không
        var isPasswordValid = await _userRepository.CheckPasswordAsync(user, request.Password);
        if (!isPasswordValid)
        {
            throw new UnauthorizedException("Địa chỉ Email hoặc Mật khẩu không chính xác.");
        }

        // 3. Kiểm tra xem tài khoản đã kích thực Email chưa
        if (!user.EmailConfirmed)
        {
            throw new BusinessRuleException("Tài khoản của bạn chưa được xác thực Email. Vui lòng nhập mã OTP đã được gửi tới hòm thư của bạn.");
        }

        // 4. Sinh mã Access Token và Refresh Token
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();

        // 5. Lưu Refresh Token mới xuống CSDL (hạn dùng 7 ngày)
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);

        // 6. Trả về kết quả xác thực dưới dạng LoginResponseDto
        return new LoginResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresIn = 86400, // 24 giờ tính theo giây
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email!,
            Role = user.Role.ToString(),
            AvatarUrl = user.AvatarUrl
        };
    }
}
