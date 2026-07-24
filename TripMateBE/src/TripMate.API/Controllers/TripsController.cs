using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TripMate.Application.DTOs.Trips;
using TripMate.Application.Features.Trips.Commands.CreateTrip;

namespace TripMate.API.Controllers;

/// <summary>
/// Quản lý Chuyến đi (Trips)
/// </summary>
public class TripsController : BaseApiController
{
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
        var result = await Mediator.Send(new CreateTripCommand
        {
            UserId = CurrentUserId,
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
