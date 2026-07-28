using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using MimeKit.Text;
using TripMate.Domain.Interfaces;

namespace TripMate.Infrastructure.Services;

/// <summary>
/// Triển khai dịch vụ gửi Email sử dụng MailKit/MimeKit (Chuẩn hiện đại cho .NET 9 trên Linux Container)
/// </summary>
public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
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
            throw new InvalidOperationException("Cấu hình SmtpSettings chưa đầy đủ.");
        }

        var smtpPort = int.TryParse(smtpPortStr, out var p) ? p : 465;

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("TripMate Support", fromAddress ?? smtpUser));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = subject;
        message.Body = new TextPart(TextFormat.Html) { Text = body };

        using var client = new SmtpClient();

        // Tự động phân loại cổng: Port 465 dùng Direct SSL/TLS, Port 587 dùng StartTls
        var socketOptions = smtpPort == 465 
            ? SecureSocketOptions.SslOnConnect 
            : SecureSocketOptions.StartTls;

        await client.ConnectAsync(smtpHost, smtpPort, socketOptions);
        await client.AuthenticateAsync(smtpUser, smtpPass);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}
