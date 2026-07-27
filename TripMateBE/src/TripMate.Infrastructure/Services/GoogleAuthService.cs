using System.Security.Cryptography;
using System.Text;
using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

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

    public async Task<GoogleUserInfo> ValidateIdTokenAsync(string idToken, string? nonce = null)
    {
        try
        {
            var clientId = _configuration["GoogleSettings:ClientId"];
            
            var settings = new GoogleJsonWebSignature.ValidationSettings();
            if (!string.IsNullOrEmpty(clientId) && !clientId.StartsWith("your_"))
            {
                settings.Audience = new[] { clientId };
            }

            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);

            if (payload == null || string.IsNullOrEmpty(payload.Email))
            {
                throw new UnauthorizedException("Google Token không hợp lệ hoặc thiếu thông tin Email.");
            }

            // Kiểm tra nonce nếu Client truyền nonce lên để phòng chống Replay Attack
            if (!string.IsNullOrEmpty(nonce) && !string.IsNullOrEmpty(payload.Nonce))
            {
                using var sha256 = SHA256.Create();
                var nonceBytes = Encoding.UTF8.GetBytes(nonce);
                var hashBytes = sha256.ComputeHash(nonceBytes);
                var expectedNonceHash = Convert.ToHexString(hashBytes).ToLower();

                if (!payload.Nonce.Equals(nonce, StringComparison.OrdinalIgnoreCase) &&
                    !payload.Nonce.Equals(expectedNonceHash, StringComparison.OrdinalIgnoreCase))
                {
                    throw new UnauthorizedException("Xác minh Google Nonce thất bại (Nghi vấn Replay Attack).");
                }
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
