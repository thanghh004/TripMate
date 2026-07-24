using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using TripMate.Domain.Exceptions;

namespace TripMate.API.Controllers;

/// <summary>
/// Lớp Controller cơ sở dùng chung cho toàn bộ các API Controllers
/// Tích hợp sẵn Mediator và CurrentUserId cho các Controller con
/// </summary>
[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    private IMediator? _mediator;

    /// <summary>
    /// Thuộc tính Mediator truy cập từ HttpContext Service Provider
    /// </summary>
    protected IMediator Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<IMediator>();

    /// <summary>
    /// Lấy UserId của người dùng hiện tại từ JWT Token đã xác thực
    /// Ném ra UnauthorizedException nếu không hợp lệ
    /// </summary>
    protected Guid CurrentUserId
    {
        get
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedException("Thông tin xác thực của tài khoản không hợp lệ. Vui lòng đăng nhập lại.");
            }
            return userId;
        }
    }
}
