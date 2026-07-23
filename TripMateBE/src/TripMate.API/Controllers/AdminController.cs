using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TripMate.API.Requests;
using TripMate.Application.Features.Admin.Commands.AdminUpdateUser;
using TripMate.Application.Features.Admin.Commands.ToggleUserStatus;
using TripMate.Application.Features.Admin.Queries.GetAllUsers;

namespace TripMate.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Lấy danh sách toàn bộ người dùng trong CSDL cho Admin
    /// </summary>
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers(CancellationToken cancellationToken)
    {
        var users = await _mediator.Send(new GetAllUsersQuery(), cancellationToken);

        return Ok(new
        {
            status = 200,
            message = "Lấy danh sách người dùng thành công.",
            data = users
        });
    }

    /// <summary>
    /// Khóa hoặc Mở khóa tài khoản người dùng
    /// </summary>
    [HttpPost("users/{userId:guid}/toggle-status")]
    public async Task<IActionResult> ToggleUserStatus(Guid userId, CancellationToken cancellationToken)
    {
        var isSuccess = await _mediator.Send(new ToggleUserStatusCommand(userId), cancellationToken);

        return Ok(new
        {
            status = 200,
            message = "Thay đổi trạng thái tài khoản thành công.",
            data = new { isSuccess }
        });
    }

    /// <summary>
    /// Admin cập nhật Vai trò, Trạng thái và Quyền Host của người dùng
    /// </summary>
    [HttpPut("users/{userId:guid}")]
    public async Task<IActionResult> UpdateUser(Guid userId, [FromBody] AdminUpdateUserRequest request, CancellationToken cancellationToken)
    {
        var command = new AdminUpdateUserCommand(userId, request.Role, request.Status, request.HostVerificationStatus);
        var isSuccess = await _mediator.Send(command, cancellationToken);

        return Ok(new
        {
            status = 200,
            message = "Cập nhật thông tin quản trị thành công.",
            data = new { isSuccess }
        });
    }
}
