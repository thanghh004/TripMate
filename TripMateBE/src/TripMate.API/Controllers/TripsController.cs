using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TripMate.Application.DTOs.Trips;
using TripMate.Application.Features.Trips.Commands.CreateTrip;

namespace TripMate.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TripsController : ControllerBase
{
    private readonly IMediator _mediator;

    public TripsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Tạo chuyến đi mới — yêu cầu tài khoản đã được phê duyệt quyền Host (Phân quyền 100% tại Backend)
    /// </summary>
    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(CreateTripResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateTrip([FromBody] CreateTripDto request, CancellationToken cancellationToken)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized(new { status = 401, message = "Thông tin xác thực không hợp lệ. Vui lòng đăng nhập lại." });
        }

        var result = await _mediator.Send(new CreateTripCommand
        {
            UserId = userId,
            Title = request.Title,
            Description = request.Description
        }, cancellationToken);

        return Ok(new
        {
            status = 200,
            message = result.Message,
            data = result
        });
    }
}
