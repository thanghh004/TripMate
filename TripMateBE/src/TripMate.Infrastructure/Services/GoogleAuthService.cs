using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;
using TripMate.Domain.Interfaces;
using TripMate.Domain.Exceptions;

namespace TripMate.Infrastructure.Services;

/// <summary>
/// Triển khai dịch vụ xác thực Google Token ở lớp Infrastructure
/// </summary>
public class GoogleAuthService : IGoogleAuthService
{
    private readonly IConfiguration _configuration;

    public GoogleAuthService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<GoogleUserInfo> ValidateIdTokenAsync(string idToken)
    {
        try
        {
            var clientId = _configuration["GoogleSettings:ClientId"];
            
            var settings = new GoogleJsonWebSignature.ValidationSettings();
            // Nếu có cấu hình ClientId thực tế, kiểm tra Audience của token
            if (!string.IsNullOrEmpty(clientId) && !clientId.StartsWith("your_"))
            {
                settings.Audience = new[] { clientId };
            }

            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);

            if (payload == null || string.IsNullOrEmpty(payload.Email))
            {
                throw new UnauthorizedException("Google Token không hợp lệ hoặc thiếu thông tin Email.");
            }

            return new GoogleUserInfo(
                Email: payload.Email,
                Name: payload.Name ?? string.Empty,
                Picture: payload.Picture,
                Subject: payload.Subject
            );
        }
        catch (InvalidJwtException ex)
        {
            throw new UnauthorizedException($"Xác minh Google Token thất bại: {ex.Message}");
        }
        catch (Exception ex) when (ex is not DomainException)
        {
            throw new UnauthorizedException($"Đã xảy ra lỗi khi xác thực với Google: {ex.Message}");
        }
    }
}
