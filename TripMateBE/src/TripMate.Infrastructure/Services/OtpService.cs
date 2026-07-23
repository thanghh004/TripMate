using Microsoft.EntityFrameworkCore;
using TripMate.Domain.Interfaces;
using TripMate.Domain.Entities;
using TripMate.Infrastructure.Data;

namespace TripMate.Infrastructure.Services;

/// <summary>
/// Dịch vụ quản lý OTP: tạo mã, lưu DB, và gửi Email xác thực
/// </summary>
public class OtpService : IOtpService
{
    private readonly TripMateDbContext _dbContext;
    private readonly IEmailService _emailService;

    public OtpService(TripMateDbContext dbContext, IEmailService emailService)
    {
        _dbContext = dbContext;
        _emailService = emailService;
    }

    public async Task<string> GenerateOtpAsync(string targetEmail, string type)
    {
        var email = targetEmail.Trim().ToLower();

        // 1. Sinh mã OTP ngẫu nhiên 6 chữ số
        var random = new Random();
        var otpCode = random.Next(100000, 999999).ToString();

        // 2. Vô hiệu hóa các mã OTP cũ chưa sử dụng của Email này để tránh spam
        var oldOtps = await _dbContext.VerificationCodes
            .Where(vc => vc.Target == email && vc.VerificationType == type && !vc.IsUsed)
            .ToListAsync();

        foreach (var oldOtp in oldOtps)
        {
            oldOtp.IsDeleted = true; // Xóa mềm mã cũ
        }

        // 3. Lưu mã OTP mới vào CSDL (hết hạn sau 15 phút)
        var verificationCode = new VerificationCode
        {
            Target = email,
            Code = otpCode,
            VerificationType = type,
            ExpiryTime = DateTime.UtcNow.AddMinutes(15),
            IsUsed = false
        };

        _dbContext.VerificationCodes.Add(verificationCode);
        await _dbContext.SaveChangesAsync();

        // 4. Gửi mã OTP trực tiếp tới Email người dùng
        var subject = "[TripMate] Mã xác thực tài khoản của bạn";
        var body = $@"
            <div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;'>
                <h2 style='color: #ff6f61;'>Chào bạn,</h2>
                <p>Bạn nhận được thư này để xác thực thông tin tài khoản tại <b>TripMate</b>.</p>
                <p>Mã OTP xác thực của bạn là:</p>
                <div style='background-color: #f4f4f4; padding: 12px; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #333; display: inline-block; border-radius: 4px;'>
                    {otpCode}
                </div>
                <p style='margin-top: 15px; color: #666;'>Mã này có hiệu lực trong vòng <b>15 phút</b>. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
                <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'/>
                <p style='color: #999; font-size: 12px;'>Đội ngũ phát triển TripMate</p>
            </div>";

        await _emailService.SendEmailAsync(email, subject, body);

        return otpCode;
    }

    public async Task<bool> VerifyOtpAsync(string targetEmail, string code, string type)
    {
        var email = targetEmail.Trim().ToLower();
        var cleanCode = code.Trim();

        // 1. Tìm mã OTP mới nhất phù hợp theo Email, Loại xác thực và Mã 6 số
        var activeOtp = await _dbContext.VerificationCodes
            .IgnoreQueryFilters()
            .Where(vc => vc.Target == email && vc.VerificationType == type && vc.Code == cleanCode)
            .OrderByDescending(vc => vc.CreatedAt)
            .FirstOrDefaultAsync();

        if (activeOtp == null || activeOtp.IsUsed || activeOtp.IsDeleted || activeOtp.ExpiryTime < DateTime.UtcNow)
        {
            return false;
        }

        // 2. Đánh dấu mã đã sử dụng thành công
        activeOtp.IsUsed = true;
        activeOtp.UpdatedAt = DateTime.UtcNow;
        
        await _dbContext.SaveChangesAsync();
        return true;
    }
}
