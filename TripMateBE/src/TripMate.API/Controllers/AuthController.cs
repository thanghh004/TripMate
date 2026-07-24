using Microsoft.AspNetCore.Mvc;
using TripMate.Application.Features.Users.Commands.Login;
using TripMate.Application.Features.Users.Commands.RefreshToken;
using TripMate.Application.Features.Users.Commands.Register;
using TripMate.Application.Features.Users.Commands.VerifyOtp;
using TripMate.Application.Features.Users.Commands.GoogleLogin;
using TripMate.Application.Features.Users.Commands.ForgotPassword;
using TripMate.Application.Features.Users.Commands.ResetPassword;

namespace TripMate.API.Controllers;

/// <summary>
/// API Xác thực hệ thống (Đăng ký, Đăng nhập, OTP, Google Login...)
/// </summary>
public class AuthController : BaseApiController
{
    /// <summary>
    /// Đăng ký tài khoản người dùng mới bằng Email
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command)
    {
        var userId = await Mediator.Send(command);
        return Ok(new
        {
            status = 200,
            message = "Đăng ký tài khoản thành công. Mã xác thực OTP đã được gửi về hòm thư Email của bạn.",
            data = new { userId }
        });
    }

    /// <summary>
    /// Xác thực mã OTP gửi về Email để kích hoạt tài khoản
    /// </summary>
    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpCommand command)
    {
        var isSuccess = await Mediator.Send(command);
        return Ok(new
        {
            status = 200,
            message = "Xác thực tài khoản thành công. Bạn đã có thể đăng nhập ngay bây giờ.",
            data = new { isSuccess }
        });
    }

    /// <summary>
    /// Đăng nhập hệ thống bằng Email và Mật khẩu
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        var response = await Mediator.Send(command);
        return Ok(new
        {
            status = 200,
            message = "Đăng nhập thành công.",
            data = response
        });
    }

    /// <summary>
    /// Cấp mới Access Token bằng Refresh Token
    /// </summary>
    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenCommand command)
    {
        var response = await Mediator.Send(command);
        return Ok(new
        {
            status = 200,
            message = "Làm mới mã Token thành công.",
            data = response
        });
    }

    /// <summary>
    /// Đăng nhập hệ thống bằng Google ID Token
    /// </summary>
    [HttpPost("google-login")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginCommand command)
    {
        var response = await Mediator.Send(command);
        return Ok(new
        {
            status = 200,
            message = "Đăng nhập bằng Google thành công.",
            data = response
        });
    }

    /// <summary>
    /// Gửi mã OTP khôi phục mật khẩu về Email người dùng
    /// </summary>
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordCommand command)
    {
        var isSuccess = await Mediator.Send(command);
        return Ok(new
        {
            status = 200,
            message = "Mã OTP khôi phục mật khẩu đã được gửi về Email của bạn.",
            data = new { isSuccess }
        });
    }

    /// <summary>
    /// Xác thực mã OTP và cập nhật mật khẩu mới
    /// </summary>
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand command)
    {
        var isSuccess = await Mediator.Send(command);
        return Ok(new
        {
            status = 200,
            message = "Đặt lại mật khẩu mới thành công. Bạn đã có thể đăng nhập bằng mật khẩu mới.",
            data = new { isSuccess }
        });
    }
}
