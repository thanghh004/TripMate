using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TripMate.Application.DTOs.Trips;
using TripMate.Application.Features.Trips.Commands.ApproveTrip;
using TripMate.Application.Features.Trips.Commands.CancelTrip;
using TripMate.Application.Features.Trips.Commands.CreateTrip;
using TripMate.Application.Features.Trips.Commands.RejectTrip;
using TripMate.Application.Features.Trips.Commands.UpdateTrip;
using TripMate.Application.Features.Trips.Queries.GetMyTrips;
using TripMate.Application.Features.Trips.Queries.GetPendingTrips;

namespace TripMate.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TripsController : BaseApiController
{
    /// <summary>
    /// Tạo chuyến đi mới (Yêu cầu tài khoản đã được duyệt quyền Host)
    /// </summary>
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<TripDto>> CreateTrip([FromBody] CreateTripDto dto)
    {
        var command = new CreateTripCommand(CurrentUserId, dto);
        var result = await Mediator.Send(command);
        return CreatedAtAction(nameof(CreateTrip), new { id = result.Id }, result);
    }

    /// <summary>
    /// Chỉnh sửa chuyến đi do mình tạo
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<ActionResult<TripDto>> UpdateTrip(Guid id, [FromBody] UpdateTripDto dto)
    {
        var command = new UpdateTripCommand(id, CurrentUserId, dto);
        var result = await Mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Hủy chuyến đi (Dành cho Organizer hoặc Admin)
    /// </summary>
    [HttpPatch("{id:guid}/cancel")]
    [Authorize]
    public async Task<IActionResult> CancelTrip(Guid id)
    {
        var isAdmin = User.IsInRole("Admin");
        var command = new CancelTripCommand(id, CurrentUserId, isAdmin);
        await Mediator.Send(command);
        return Ok(new { message = "Đã hủy chuyến đi thành công." });
    }

    /// <summary>
    /// Lấy danh sách chuyến đi do người dùng hiện tại làm Organizer
    /// </summary>
    [HttpGet("my-trips")]
    [Authorize]
    public async Task<ActionResult<List<TripDto>>> GetMyTrips()
    {
        var result = await Mediator.Send(new GetMyTripsQuery(CurrentUserId));
        return Ok(result);
    }

    // ─── ADMIN CONTROLS ───

    /// <summary>
    /// [Admin] Lấy danh sách chuyến đi chờ duyệt (PendingReview)
    /// </summary>
    [HttpGet("admin/pending")]
    [Authorize(Roles = "Admin,0")]
    public async Task<ActionResult<List<TripDto>>> GetPendingTrips()
    {
        var result = await Mediator.Send(new GetPendingTripsQuery());
        return Ok(result);
    }

    /// <summary>
    /// [Admin] Phê duyệt chuyến đi
    /// </summary>
    [HttpPatch("admin/{id:guid}/approve")]
    [Authorize(Roles = "Admin,0")]
    public async Task<ActionResult<TripDto>> ApproveTrip(Guid id)
    {
        var result = await Mediator.Send(new ApproveTripCommand(id));
        return Ok(result);
    }

    /// <summary>
    /// [Admin] Từ chối chuyến đi kèm lý do
    /// </summary>
    [HttpPatch("admin/{id:guid}/reject")]
    [Authorize(Roles = "Admin,0")]
    public async Task<ActionResult<TripDto>> RejectTrip(Guid id, [FromBody] RejectTripDto dto)
    {
        var result = await Mediator.Send(new RejectTripCommand(id, dto));
        return Ok(result);
    }
}
