using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;
using MimeKit.Text;
using TripMate.Domain.Interfaces;

namespace TripMate.Infrastructure.Services;

/// <summary>
/// Triển khai dịch vụ gửi Email sử dụng MailKit/MimeKit với cơ chế fallback tự động (chống crash API khi SMTP timeout)
/// </summary>
public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        var smtpHost = _configuration["SmtpSettings:Host"];
        var smtpPortStr = _configuration["SmtpSettings:Port"];
        var smtpUser = _configuration["SmtpSettings:Username"];
        var smtpPass = _configuration["SmtpSettings:Password"];
        var fromAddress = _configuration["SmtpSettings:FromAddress"];

        if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(smtpUser) || string.IsNullOrEmpty(smtpPass))
        {
            _logger.LogWarning("[SMTP WARNING] Cấu hình SmtpSettings chưa đầy đủ. Bỏ qua gửi email thật.");
            return;
        }

        var smtpPort = int.TryParse(smtpPortStr, out var p) ? p : 465;

        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("TripMate Support", fromAddress ?? smtpUser));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;
            message.Body = new TextPart(TextFormat.Html) { Text = body };

            using var client = new SmtpClient();
            // Đặt timeout 5 giây để tránh treo lâu nếu mạng bị chặn
            client.Timeout = 5000;

            var socketOptions = smtpPort == 465 
                ? SecureSocketOptions.SslOnConnect 
                : SecureSocketOptions.StartTls;

            await client.ConnectAsync(smtpHost, smtpPort, socketOptions);
            await client.AuthenticateAsync(smtpUser, smtpPass);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("[EMAIL SUCCESS] Đã gửi email thành công tới {ToEmail}", toEmail);
        }
        catch (Exception ex)
        {
            // Trích xuất mã OTP từ nội dung HTML (nếu có) để in ra log cho DEV test
            _logger.LogError(ex, "[SMTP TIMEOUT / ERROR] Không thể kết nối máy chủ Mail SMTP ({Host}:{Port}). Email: {ToEmail}", smtpHost, smtpPort, toEmail);
            _logger.LogWarning("=================================================");
            _logger.LogWarning("📧 [FALLBACK DEV LOG] NỘI DUNG EMAIL GỬI TỚI: {ToEmail}", toEmail);
            _logger.LogWarning("📌 Tiêu đề: {Subject}", subject);
            _logger.LogWarning("=================================================");
        }
    }
}
