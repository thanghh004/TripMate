using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TripMate.Domain.Interfaces;

namespace TripMate.Infrastructure.Services;

/// <summary>
/// Dịch vụ gửi Email qua Mailjet REST API (Port 443 HTTPS)
/// Cho phép gửi tới MỌI Gmail người dùng, miễn phí 200 email/ngày, không bị chặn bởi Render
/// </summary>
public class MailjetEmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<MailjetEmailService> _logger;
    private readonly HttpClient _httpClient;

    public MailjetEmailService(
        IConfiguration configuration,
        ILogger<MailjetEmailService> logger,
        HttpClient httpClient)
    {
        _configuration = configuration;
        _logger = logger;
        _httpClient = httpClient;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        var apiKey = _configuration["MailjetSettings:ApiKey"];
        var secretKey = _configuration["MailjetSettings:SecretKey"];
        var senderEmail = _configuration["MailjetSettings:SenderEmail"] ?? "tripmate004@gmail.com";

        if (string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(secretKey))
        {
            _logger.LogWarning("[MAILJET WARNING] Chưa cấu hình MailjetSettings:ApiKey hoặc SecretKey.");
            return;
        }

        try
        {
            var payload = new
            {
                Messages = new[]
                {
                    new
                    {
                        From = new
                        {
                            Email = senderEmail,
                            Name = "TripMate Support"
                        },
                        To = new[]
                        {
                            new
                            {
                                Email = toEmail,
                                Name = toEmail
                            }
                        },
                        Subject = subject,
                        HTMLPart = body
                    }
                }
            };

            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Mailjet API v3.1 yêu cầu Basic Authentication (ApiKey:SecretKey)
            var authToken = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{apiKey}:{secretKey}"));
            
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authToken);
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var response = await _httpClient.PostAsync("https://api.mailjet.com/v3.1/send", content);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("[MAILJET SUCCESS] Đã gửi email OTP thành công tới {ToEmail}", toEmail);
            }
            else
            {
                _logger.LogError("[MAILJET ERROR] Gửi email thất bại. Status: {Status}. Response: {Response}", response.StatusCode, responseBody);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[MAILJET EXCEPTION] Ngoại lệ khi gửi mail tới {ToEmail}", toEmail);
        }
    }
}
