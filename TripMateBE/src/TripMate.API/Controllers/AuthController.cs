using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TripMate.Application.Features.Users.Commands.CheckOtp;
using TripMate.Application.Features.Users.Commands.ForgotPassword;
using TripMate.Application.Features.Users.Commands.GoogleLogin;
using TripMate.Application.Features.Users.Commands.Login;
using TripMate.Application.Features.Users.Commands.RefreshToken;
using TripMate.Application.Features.Users.Commands.Register;
using TripMate.Application.Features.Users.Commands.ResetPassword;
using TripMate.Application.Features.Users.Commands.VerifyOtp;

namespace TripMate.API.Controllers;

/// <summary>
/// API Xác thực hệ thống (Đăng ký, Đăng nhập, OTP, Google Login...)
/// </summary>
public class AuthController : BaseApiController
{
    /// <summary>
    /// Đăng ký tài khoản người dùng mới bằng Email
    /// Giới hạn: 5 lượt/phút/IP
    /// </summary>
    [HttpPost("register")]
    [EnableRateLimiting("AuthPolicy")]
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
    /// Giới hạn: 5 lượt/phút/IP
    /// </summary>
    [HttpPost("verify-otp")]
    [EnableRateLimiting("AuthPolicy")]
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
    /// Gửi lại mã OTP xác thực đăng ký tài khoản
    /// Giới hạn: 5 lượt/phút/IP
    /// </summary>
    [HttpPost("resend-otp")]
    [EnableRateLimiting("AuthPolicy")]
    public async Task<IActionResult> ResendOtp([FromBody] TripMate.Application.Features.Users.Commands.ResendOtp.ResendOtpCommand command)
    {
        var isSuccess = await Mediator.Send(command);
        return Ok(new
        {
            status = 200,
            message = "Mã OTP mới đã được gửi lại về hòm thư Email của bạn.",
            data = new { isSuccess }
        });
    }

    /// <summary>
    /// Kiểm tra mã OTP hợp lệ mà KHÔNG đánh dấu đã sử dụng
    /// Dùng cho bước xác thực OTP trước khi nhập mật khẩu mới (Quên mật khẩu Bước 2)
    /// Giới hạn: 5 lượt/phút/IP
    /// </summary>
    [HttpPost("check-otp")]
    [EnableRateLimiting("AuthPolicy")]
    public async Task<IActionResult> CheckOtp([FromBody] CheckOtpCommand command)
    {
        var isValid = await Mediator.Send(command);
        return Ok(new
        {
            status = 200,
            message = "Mã OTP hợp lệ.",
            data = new { isValid }
        });
    }

    /// <summary>
    /// Đăng nhập hệ thống bằng Email và Mật khẩu
    /// Giới hạn: 5 lượt/phút/IP — Chống Brute-force Attack
    /// </summary>
    [HttpPost("login")]
    [EnableRateLimiting("AuthPolicy")]
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
    /// Giới hạn: Theo GeneralPolicy (60 lượt/phút/IP)
    /// </summary>
    [HttpPost("refresh-token")]
    [EnableRateLimiting("GeneralPolicy")]
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
    /// Giới hạn: 5 lượt/phút/IP
    /// </summary>
    [HttpPost("google-login")]
    [EnableRateLimiting("AuthPolicy")]
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
    /// Giới hạn: 5 lượt/phút/IP — Chống spam gửi OTP
    /// </summary>
    [HttpPost("forgot-password")]
    [EnableRateLimiting("AuthPolicy")]
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
    /// Giới hạn: 5 lượt/phút/IP
    /// </summary>
    [HttpPost("reset-password")]
    [EnableRateLimiting("AuthPolicy")]
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
