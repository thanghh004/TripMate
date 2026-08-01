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
    /// Lấy danh sách chuyến đi công khai đã duyệt (Status Open hoặc Full) cho Trang chủ và Trang Khám phá
    /// </summary>
    [HttpGet("public")]
    [AllowAnonymous]
    public async Task<ActionResult<List<TripDto>>> GetPublicTrips()
    {
        var result = await Mediator.Send(new Application.Features.Trips.Queries.GetPublicTrips.GetPublicTripsQuery());
        return Ok(result);
    }

    /// <summary>
    /// Lấy chi tiết thông tin 1 chuyến đi theo ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<TripDto>> GetTripById(Guid id)
    {
        var result = await Mediator.Send(new Application.Features.Trips.Queries.GetTripById.GetTripByIdQuery(id));
        return Ok(result);
    }

    /// <summary>
    /// Tạo chuyến đi mới (Yêu cầu tài khoản đã được duyệt quyền Host và vai trò User)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "User,0")]
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
    [Authorize(Roles = "User,0")]
    public async Task<ActionResult<TripDto>> UpdateTrip(Guid id, [FromBody] UpdateTripDto dto)
    {
        var command = new UpdateTripCommand(id, CurrentUserId, dto);
        var result = await Mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Đăng ký tham gia chuyến đi
    /// </summary>
    [HttpPost("{id:guid}/join")]
    [Authorize]
    public async Task<IActionResult> JoinTrip(Guid id)
    {
        var command = new Application.Features.Trips.Commands.JoinTrip.JoinTripCommand(id, CurrentUserId);
        await Mediator.Send(command);
        return Ok(new { message = "Đã gửi yêu cầu tham gia chuyến đi, vui lòng chờ Trưởng đoàn phê duyệt!" });
    }

    /// <summary>
    /// Trưởng đoàn phê duyệt thành viên tham gia chuyến đi
    /// </summary>
    [HttpPost("{id:guid}/members/{memberUserId:guid}/approve")]
    [Authorize]
    public async Task<IActionResult> ApproveMember(Guid id, Guid memberUserId)
    {
        var command = new Application.Features.Trips.Commands.ApproveTripMember.ApproveTripMemberCommand(id, memberUserId, CurrentUserId);
        await Mediator.Send(command);
        return Ok(new { message = "Đã phê duyệt thành viên tham gia chuyến đi!" });
    }

    /// <summary>
    /// Thành viên tự hủy đăng ký tham gia chuyến đi
    /// </summary>
    [HttpPost("{id:guid}/cancel-registration")]
    [Authorize]
    public async Task<IActionResult> CancelRegistration(Guid id, [FromBody] CancelRegistrationDto? dto)
    {
        var command = new Application.Features.Trips.Commands.CancelRegistration.CancelRegistrationCommand(id, CurrentUserId, dto?.Reason);
        await Mediator.Send(command);
        return Ok(new { message = "Đã hủy đăng ký tham gia chuyến đi thành công." });
    }

    /// <summary>
    /// Trưởng đoàn từ chối thành viên tham gia chuyến đi
    /// </summary>
    [HttpPost("{id:guid}/members/{memberUserId:guid}/reject")]
    [Authorize]
    public async Task<IActionResult> RejectMember(Guid id, Guid memberUserId)
    {
        var command = new Application.Features.Trips.Commands.RejectTripMember.RejectTripMemberCommand(id, memberUserId, CurrentUserId);
        await Mediator.Send(command);
        return Ok(new { message = "Đã từ chối yêu cầu tham gia của thành viên!" });
    }

    /// <summary>
    /// Hủy chuyến đi (Dành cho Organizer hoặc Admin)
    /// </summary>
    [HttpPatch("{id:guid}/cancel")]
    [Authorize]
    public async Task<IActionResult> CancelTrip(Guid id, [FromBody] CancelTripDto? dto)
    {
        var isAdmin = User.IsInRole("Admin") || User.IsInRole("1");
        var command = new CancelTripCommand(id, CurrentUserId, isAdmin, dto?.Reason);
        await Mediator.Send(command);
        return Ok(new { message = "Đã hủy chuyến đi thành công." });
    }

    /// <summary>
    /// Lấy danh sách chuyến đi do người dùng hiện tại làm Organizer
    /// </summary>
    [HttpGet("my-trips")]
    [Authorize(Roles = "User,0")]
    public async Task<ActionResult<List<TripDto>>> GetMyTrips()
    {
        var result = await Mediator.Send(new GetMyTripsQuery(CurrentUserId));
        return Ok(result);
    }

    /// <summary>
    /// Lấy danh sách các chuyến đi mà người dùng hiện tại đã gửi yêu cầu/đã tham gia làm thành viên
    /// </summary>
    [HttpGet("joined")]
    [Authorize]
    public async Task<ActionResult<List<TripDto>>> GetJoinedTrips()
    {
        var result = await Mediator.Send(new Application.Features.Trips.Queries.GetJoinedTrips.GetJoinedTripsQuery(CurrentUserId));
        return Ok(result);
    }

    // ─── ADMIN CONTROLS ───

    /// <summary>
    /// [Admin] Lấy danh sách toàn bộ chuyến đi trong hệ thống
    /// </summary>
    [HttpGet("admin/all")]
    [Authorize(Roles = "Admin,1")]
    public async Task<ActionResult<List<TripDto>>> GetAdminAllTrips()
    {
        var result = await Mediator.Send(new Application.Features.Trips.Queries.GetAdminAllTrips.GetAdminAllTripsQuery());
        return Ok(result);
    }

    /// <summary>
    /// [Admin] Lấy danh sách chuyến đi chờ duyệt (PendingReview)
    /// </summary>
    [HttpGet("admin/pending")]
    [Authorize(Roles = "Admin,1")]
    public async Task<ActionResult<List<TripDto>>> GetPendingTrips()
    {
        var result = await Mediator.Send(new GetPendingTripsQuery());
        return Ok(result);
    }

    /// <summary>
    /// [Admin] Phê duyệt chuyến đi
    /// </summary>
    [HttpPatch("admin/{id:guid}/approve")]
    [Authorize(Roles = "Admin,1")]
    public async Task<ActionResult<TripDto>> ApproveTrip(Guid id)
    {
        var result = await Mediator.Send(new ApproveTripCommand(id));
        return Ok(result);
    }

    /// <summary>
    /// [Admin] Từ chối chuyến đi kèm lý do
    /// </summary>
    [HttpPatch("admin/{id:guid}/reject")]
    [Authorize(Roles = "Admin,1")]
    public async Task<ActionResult<TripDto>> RejectTrip(Guid id, [FromBody] RejectTripDto dto)
    {
        var result = await Mediator.Send(new RejectTripCommand(id, dto));
        return Ok(result);
    }
}
