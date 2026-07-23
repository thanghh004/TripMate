using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TripMate.API.Requests;
using TripMate.Application.Features.Users.Commands.UpdateProfile;
using TripMate.Application.Features.Users.Queries.GetMyProfile;
using TripMate.Domain.Interfaces;

namespace TripMate.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IFileStorageService _fileStorageService;

    public UsersController(IMediator mediator, IFileStorageService fileStorageService)
    {
        _mediator = mediator;
        _fileStorageService = fileStorageService;
    }

    /// <summary>
    /// Lấy thông tin hồ sơ cá nhân đầy đủ của người dùng hiện tại
    /// </summary>
    [HttpGet("me")]
    public async Task<IActionResult> GetMe(CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { status = 401, message = "Thông tin xác thực không hợp lệ. Vui lòng đăng nhập lại." });
        }

        var profile = await _mediator.Send(new GetMyProfileQuery(userId), cancellationToken);

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
    public async Task<IActionResult> UploadFile(IFormFile file, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra file có được gửi lên không
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { status = 400, message = "Vui lòng chọn file để tải lên." });
        }

        // 2. Chỉ cho phép các định dạng ảnh hợp lệ
        var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
        {
            return BadRequest(new
            {
                status = 400,
                message = "Chỉ chấp nhận các định dạng ảnh: JPEG, PNG, WebP."
            });
        }

        // 3. Kiểm tra kích thước tối đa (5MB)
        if (file.Length > 5 * 1024 * 1024)
        {
            return BadRequest(new { status = 400, message = "Kích thước ảnh không được vượt quá 5MB." });
        }

        // 4. Gọi service lưu file và lấy đường dẫn tương đối
        await using var stream = file.OpenReadStream();
        var relativePath = await _fileStorageService.UploadAsync(stream, file.FileName, file.ContentType, cancellationToken);

        // 5. Build URL đầy đủ từ request host hiện tại
        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var fileUrl = $"{baseUrl}{relativePath}";

        return Ok(new
        {
            status = 200,
            message = "Tải ảnh lên thành công.",
            data = new { url = fileUrl }
        });
    }

    /// <summary>
    /// Cập nhật thông tin cá nhân của người dùng hiện tại (bao gồm cả CCCD mặt trước/sau)
    /// </summary>
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request, CancellationToken cancellationToken)
    {
        // 1. Lấy UserId từ Claims của JWT Token đã xác thực
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new
            {
                status = 401,
                message = "Thông tin xác thực của tài khoản không hợp lệ. Vui lòng đăng nhập lại."
            });
        }

        // 2. Gửi Command qua MediatR để xử lý cập nhật
        var command = new UpdateProfileCommand(
            userId,
            request.FullName,
            request.PhoneNumber,
            request.Gender,
            request.BirthDate,
            request.Bio,
            request.AvatarUrl,
            request.IdentityCardFrontUrl,
            request.IdentityCardBackUrl
        );

        var isSuccess = await _mediator.Send(command, cancellationToken);

        return Ok(new
        {
            status = 200,
            message = "Cập nhật hồ sơ thông tin cá nhân thành công.",
            data = new { isSuccess }
        });
    }
}