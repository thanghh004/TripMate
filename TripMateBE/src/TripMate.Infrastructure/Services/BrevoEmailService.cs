using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TripMate.Domain.Interfaces;

namespace TripMate.Infrastructure.Services;

/// <summary>
/// Gửi Email qua Brevo Transactional API (HTTPS Port 443)
/// Miễn phí 300 email/ngày, gửi được tới MỌI địa chỉ email, không cần domain riêng
/// </summary>
public class BrevoEmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<BrevoEmailService> _logger;
    private readonly HttpClient _httpClient;

    public BrevoEmailService(
        IConfiguration configuration,
        ILogger<BrevoEmailService> logger,
        HttpClient httpClient)
    {
        _configuration = configuration;
        _logger = logger;
        _httpClient = httpClient;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        var apiKey = _configuration["BrevoSettings:ApiKey"];

        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogWarning("[BREVO WARNING] Chưa cấu hình BrevoSettings:ApiKey.");
            return;
        }

        try
        {
            var payload = new
            {
                sender = new { name = "TripMate Support", email = "tripmate004@gmail.com" },
                to = new[] { new { email = toEmail } },
                subject = subject,
                htmlContent = body
            };

            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("api-key", apiKey);
            _httpClient.DefaultRequestHeaders.Add("Accept", "application/json");

            var response = await _httpClient.PostAsync("https://api.brevo.com/v3/smtp/email", content);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("[BREVO SUCCESS] Đã gửi email thành công tới {ToEmail}", toEmail);
            }
            else
            {
                _logger.LogError("[BREVO ERROR] Gửi email thất bại. Status: {Status}. Body: {Body}", response.StatusCode, responseBody);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[BREVO EXCEPTION] Không thể gửi email tới {ToEmail}", toEmail);
        }
    }
}
