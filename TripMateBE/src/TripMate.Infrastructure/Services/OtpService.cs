using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
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
    private readonly ILogger<OtpService> _logger;

    public OtpService(TripMateDbContext dbContext, IEmailService emailService, ILogger<OtpService> logger)
    {
        _dbContext = dbContext;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<string> GenerateOtpAsync(string targetEmail, string type)
    {
        var email = targetEmail.Trim().ToLower();

        // 1. Sinh mã OTP ngẫu nhiên 6 chữ số bằng RandomNumberGenerator bảo mật cao (CSPRNG)
        var otpCode = System.Security.Cryptography.RandomNumberGenerator.GetInt32(100000, 1000000).ToString();

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

        // IN NỔI BẬT MÃ OTP RA RENDER CONSOLE LOG DỄ DÀNG TEST
        _logger.LogInformation("=================================================");
        _logger.LogInformation("🔑 [MÃ OTP XÁC THỰC] Target Email: {Email} | OTP Code: {OtpCode} | Type: {Type}", email, otpCode, type);
        _logger.LogInformation("=================================================");

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

        // 1. Tìm mã OTP mới nhất chưa dùng và chưa hết hạn của Email theo loại xác thực
        var activeOtp = await _dbContext.VerificationCodes
            .IgnoreQueryFilters()
            .Where(vc => vc.Target == email && vc.VerificationType == type && !vc.IsUsed && !vc.IsDeleted)
            .OrderByDescending(vc => vc.CreatedAt)
            .FirstOrDefaultAsync();

        // Nếu không có mã hoặc mã đã hết hạn
        if (activeOtp == null || activeOtp.ExpiryTime < DateTime.UtcNow)
        {
            return false;
        }

        // 2. Kiểm tra mã OTP nhập vào có khớp không
        if (activeOtp.Code != cleanCode)
        {
            activeOtp.FailedAttempts += 1;
            activeOtp.UpdatedAt = DateTime.UtcNow;

            // Nếu nhập sai từ 5 lần trở lên -> Tự động vô hiệu hóa mã OTP này (Xóa mềm)
            if (activeOtp.FailedAttempts >= 5)
            {
                activeOtp.IsDeleted = true;
            }

            await _dbContext.SaveChangesAsync();
            return false;
        }

        // 3. Đánh dấu mã đã sử dụng thành công khi nhập đúng
        activeOtp.IsUsed = true;
        activeOtp.UpdatedAt = DateTime.UtcNow;
        
        await _dbContext.SaveChangesAsync();
        return true;
    }
}
