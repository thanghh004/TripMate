using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Resend;
using TripMate.Domain.Interfaces;

namespace TripMate.Infrastructure.Services;

/// <summary>
/// Triển khai dịch vụ gửi Email sử dụng Resend HTTPS API (Port 443) - Chuẩn Cloud Production không lo bị Render/Cloud Provider chặn cổng SMTP
/// </summary>
public class ResendEmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<ResendEmailService> _logger;

    public ResendEmailService(IConfiguration configuration, ILogger<ResendEmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        var apiKey = _configuration["Resend:ApiKey"];

        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogWarning("[RESEND WARNING] Chưa cấu hình Resend:ApiKey trong appsettings/biến môi trường.");
            return;
        }

        try
        {
            // Khởi tạo Resend Client dùng HTTPS REST API (Port 443)
            var resend = ResendClient.Create(apiKey);

            var message = new EmailMessage
            {
                // Resend cho phép gửi thử nghiệm từ onboarding@resend.dev tới email đăng ký tài khoản Resend
                From = "TripMate <onboarding@resend.dev>",
                To = { toEmail },
                Subject = subject,
                HtmlBody = body
            };

            var resp = await resend.EmailSendAsync(message);
            _logger.LogInformation("[RESEND SUCCESS] Đã gửi email thành công tới {ToEmail}! ID: {Id}", toEmail, resp.Content);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[RESEND ERROR] Không thể gửi email tới {ToEmail} qua Resend API", toEmail);
        }
    }
}
