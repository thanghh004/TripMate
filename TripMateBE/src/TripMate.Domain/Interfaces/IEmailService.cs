namespace TripMate.Domain.Interfaces;

/// <summary>
/// Giao diện dịch vụ gửi Email thật
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Gửi email
    /// </summary>
    /// <param name="toEmail">Địa chỉ email nhận</param>
    /// <param name="subject">Tiêu đề email</param>
    /// <param name="body">Nội dung email (hỗ trợ HTML)</param>
    Task SendEmailAsync(string toEmail, string subject, string body);
}
