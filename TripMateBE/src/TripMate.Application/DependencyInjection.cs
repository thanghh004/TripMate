using System.Reflection;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

using TripMate.Application.Common.Behaviours;

namespace TripMate.Application;

/// <summary>
/// Lớp cấu hình Dependency Injection cho các dịch vụ thuộc Application Layer
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        // 1. Đăng ký MediatR cho toàn bộ Assembly này
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(assembly);
            
            // Đăng ký Validation Behaviour của MediatR tự động kiểm tra dữ liệu đầu vào
            cfg.AddOpenBehavior(typeof(ValidationBehaviour<,>));
        });

        // 2. Đăng ký tự động toàn bộ Validator của FluentValidation
        services.AddValidatorsFromAssembly(assembly);

        return services;
    }
}
