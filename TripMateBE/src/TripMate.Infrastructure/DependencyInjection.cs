using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TripMate.Domain.Interfaces;
using TripMate.Infrastructure.Repositories;
using TripMate.Infrastructure.Services;

namespace TripMate.Infrastructure;

/// <summary>
/// Lớp cấu hình Dependency Injection cho các dịch vụ thuộc Infrastructure Layer
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // 1. Đăng ký Unit of Work & Generic Repository
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped(typeof(IRepository<>), typeof(GenericRepository<>));

        // 2. Đăng ký Repository quản lý User
        services.AddScoped<IUserRepository, UserRepository>();

        // 3. Đăng ký Dịch vụ xác thực mã OTP
        services.AddScoped<IOtpService, OtpService>();

        // 4. Đăng ký dịch vụ Gửi Email thật qua SMTP
        services.AddScoped<IEmailService, EmailService>();

        // 5. Đăng ký dịch vụ cấp phát JWT & Refresh Token
        services.AddScoped<ITokenService, TokenService>();

        // 6. Đăng ký dịch vụ Xác thực Google Token
        services.AddScoped<IGoogleAuthService, GoogleAuthService>();

        // 7. Đăng ký dịch vụ Lưu trữ File cục bộ (wwwroot/uploads)
        services.AddScoped<IFileStorageService, LocalFileStorageService>();

        return services;
    }
}
