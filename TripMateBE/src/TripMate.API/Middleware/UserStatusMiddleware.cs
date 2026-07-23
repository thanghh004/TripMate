using System.Security.Claims;
using System.Text.Json;
using TripMate.Domain.Enums;
using TripMate.Domain.Interfaces;

namespace TripMate.API.Middleware;

/// <summary>
/// Middleware tự động kiểm tra trạng thái khóa tài khoản thời gian thực cho người dùng đã đăng nhập.
/// Nếu tài khoản bị Admin khóa (Status == Suspended), lập tức chặn đứng request và trả về lỗi 401 Unauthorized.
/// </summary>
public class UserStatusMiddleware
{
    private readonly RequestDelegate _next;

    public UserStatusMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IUserRepository userRepository)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var userId))
            {
                var user = await userRepository.GetByIdAsync(userId, context.RequestAborted);
                if (user != null && user.Status == UserStatus.Suspended)
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    context.Response.ContentType = "application/json";

                    var responsePayload = new
                    {
                        status = 401,
                        message = "Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ hỗ trợ."
                    };

                    var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
                    await context.Response.WriteAsync(JsonSerializer.Serialize(responsePayload, jsonOptions));
                    return;
                }
            }
        }

        await _next(context);
    }
}
