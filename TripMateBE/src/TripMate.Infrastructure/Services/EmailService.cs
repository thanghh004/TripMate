using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using TripMate.Domain.Interfaces;

namespace TripMate.Infrastructure.Services;

/// <summary>
/// Triển khai dịch vụ gửi Email thật sử dụng SMTP Client mặc định của .NET
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
        var enableSslStr = _configuration["SmtpSettings:EnableSsl"];
        var fromAddress = _configuration["SmtpSettings:FromAddress"];

        if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(smtpUser) || string.IsNullOrEmpty(smtpPass))
        {
            throw new InvalidOperationException("Cấu hình SmtpSettings trong appsettings.json chưa đầy đủ.");
        }

        var smtpPort = int.Parse(smtpPortStr ?? "587");
        var enableSsl = bool.Parse(enableSslStr ?? "true");

        using var client = new SmtpClient(smtpHost, smtpPort)
        {
            Credentials = new NetworkCredential(smtpUser, smtpPass),
            EnableSsl = enableSsl
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(fromAddress ?? smtpUser, "TripMate Support"),
            Subject = subject,
            Body = body,
            IsBodyHtml = true
        };
        
        mailMessage.To.Add(toEmail);

        await client.SendMailAsync(mailMessage);
    }
}
