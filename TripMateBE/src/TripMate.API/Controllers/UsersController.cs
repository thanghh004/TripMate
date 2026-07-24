using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TripMate.Application.DTOs.Admin;
using TripMate.Application.DTOs.Users;
using TripMate.Application.Features.Admin.Commands.AdminUpdateUser;
using TripMate.Application.Features.Admin.Commands.ApproveHostVerification;
using TripMate.Application.Features.Admin.Commands.RejectHostVerification;
using TripMate.Application.Features.Admin.Commands.ToggleUserStatus;
using TripMate.Application.Features.Admin.Queries.GetAllUsers;
using TripMate.Application.Features.Admin.Queries.GetPendingHostVerifications;
using TripMate.Application.Features.Users.Commands.RequestHostVerification;
using TripMate.Application.Features.Users.Commands.UpdateProfile;
using TripMate.Application.Features.Users.Queries.GetMyProfile;
using TripMate.Domain.Interfaces;

namespace TripMate.API.Controllers;

/// <summary>
/// Quản lý người dùng (User & Admin operations)
/// </summary>
[Authorize]
public class UsersController : BaseApiController
{
    private readonly IFileStorageService _fileStorageService;

    public UsersController(IFileStorageService fileStorageService)
    {
        _fileStorageService = fileStorageService;
    }

    #region User Endpoints

    /// <summary>
    /// Lấy thông tin hồ sơ cá nhân đầy đủ của người dùng hiện tại
    /// </summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(UserProfileResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMe(CancellationToken cancellationToken)
    {
        var profile = await Mediator.Send(new GetMyProfileQuery(CurrentUserId), cancellationToken);

        return Ok(new
        {
            status = 200,
            message = "Lấy thông tin hồ sơ thành công.",
            data = profile
        });
    }

    /// <summary>
    /// Upload ảnh (avatar, CCCD mặt trước/sau) và trả về URL truy cập công khai
    /// </summary>
    [HttpPost("upload")]
    [RequestSizeLimit(10 * 1024 * 1024)] // Giới hạn 10MB
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UploadFile(IFormFile file, CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { status = 400, message = "Vui lòng chọn file để tải lên." });
        }

        var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
        {
            return BadRequest(new
            {
                status = 400,
                message = "Chỉ chấp nhận các định dạng ảnh: JPEG, PNG, WebP."
            });
        }

        if (file.Length > 5 * 1024 * 1024)
        {
            return BadRequest(new { status = 400, message = "Kích thước ảnh không được vượt quá 5MB." });
        }

        await using var stream = file.OpenReadStream();
        var relativePath = await _fileStorageService.UploadAsync(stream, file.FileName, file.ContentType, cancellationToken);
        var fileUrl = $"{Request.Scheme}://{Request.Host}{relativePath}";

        return Ok(new
        {
            status = 200,
            message = "Tải ảnh lên thành công.",
            data = new { url = fileUrl }
        });
    }

    /// <summary>
    /// Cập nhật thông tin cá nhân của người dùng hiện tại
    /// </summary>
    [HttpPut("profile")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequestDto request, CancellationToken cancellationToken)
    {
        var command = new UpdateProfileCommand(
            CurrentUserId,
            request.FullName,
            request.PhoneNumber,
            request.Gender,
            request.BirthDate,
            request.Bio,
            request.AvatarUrl,
            request.IdentityCardFrontUrl,
            request.IdentityCardBackUrl,
            request.IdentityCardNumber
        );

        var isSuccess = await Mediator.Send(command, cancellationToken);

        return Ok(new
        {
            status = 200,
            message = "Cập nhật hồ sơ thông tin cá nhân thành công.",
            data = new { isSuccess }
        });
    }

    /// <summary>
    /// Gửi yêu cầu duyệt quyền tạo chuyến/tổ chức chuyến đi cho Admin
    /// </summary>
    [HttpPost("request-host-verification")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RequestHostVerification(CancellationToken cancellationToken)
    {
        var isSuccess = await Mediator.Send(new RequestHostVerificationCommand(CurrentUserId), cancellationToken);

        return Ok(new
        {
            status = 200,
            message = "Gửi yêu cầu duyệt quyền tạo chuyến thành công! Vui lòng chờ Admin xét duyệt.",
            data = new { isSuccess }
        });
    }

    #endregion

    #region Admin Management Endpoints

    /// <summary>
    /// Lấy danh sách toàn bộ người dùng trong CSDL (Admin)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin,0")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllUsers(CancellationToken cancellationToken)
    {
        var users = await Mediator.Send(new GetAllUsersQuery(), cancellationToken);

        return Ok(new
        {
            status = 200,
            message = "Lấy danh sách người dùng thành công.",
            data = users
        });
    }

    /// <summary>
    /// Lấy danh sách các yêu cầu xác thực Host đang chờ duyệt (Admin)
    /// </summary>
    [HttpGet("host-verifications/pending")]
    [Authorize(Roles = "Admin,0")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPendingHostVerifications(CancellationToken cancellationToken)
    {
        var requests = await Mediator.Send(new GetPendingHostVerificationsQuery(), cancellationToken);

        return Ok(new
        {
            status = 200,
            message = "Lấy danh sách chờ duyệt Host thành công.",
            data = requests
        });
    }

    /// <summary>
    /// Admin phê duyệt yêu cầu xác thực Host
    /// </summary>
    [HttpPost("host-verifications/{userId:guid}/approve")]
    [Authorize(Roles = "Admin,0")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ApproveHostVerification(Guid userId, CancellationToken cancellationToken)
    {
        var isSuccess = await Mediator.Send(new ApproveHostVerificationCommand(userId), cancellationToken);

        return Ok(new
        {
            status = 200,
            message = "Phê duyệt quyền tạo chuyến thành công.",
            data = new { isSuccess }
        });
    }

    /// <summary>
    /// Admin từ chối yêu cầu xác thực Host
    /// </summary>
    [HttpPost("host-verifications/{userId:guid}/reject")]
    [Authorize(Roles = "Admin,0")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> RejectHostVerification(Guid userId, [FromBody] RejectHostVerificationRequestDto? request, CancellationToken cancellationToken)
    {
        var isSuccess = await Mediator.Send(new RejectHostVerificationCommand(userId, request?.Reason), cancellationToken);

        return Ok(new
        {
            status = 200,
            message = "Từ chối quyền tạo chuyến thành công.",
            data = new { isSuccess }
        });
    }

    /// <summary>
    /// Khóa hoặc Mở khóa tài khoản người dùng (Admin)
    /// </summary>
    [HttpPost("{userId:guid}/toggle-status")]
    [Authorize(Roles = "Admin,0")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ToggleUserStatus(Guid userId, CancellationToken cancellationToken)
    {
        var isSuccess = await Mediator.Send(new ToggleUserStatusCommand(userId), cancellationToken);

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
    [HttpPut("{userId:guid}")]
    [Authorize(Roles = "Admin,0")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateUser(Guid userId, [FromBody] AdminUpdateUserRequestDto request, CancellationToken cancellationToken)
    {
        var command = new AdminUpdateUserCommand(userId, request.Role, request.Status, request.HostVerificationStatus);
        var isSuccess = await Mediator.Send(command, cancellationToken);

        return Ok(new
        {
            status = 200,
            message = "Cập nhật thông tin quản trị thành công.",
            data = new { isSuccess }
        });
    }

    #endregion
}