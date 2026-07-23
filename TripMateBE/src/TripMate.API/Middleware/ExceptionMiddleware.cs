using System.Net;
using System.Text.Json;
using TripMate.Domain.Exceptions;

namespace TripMate.API.Middleware;

/// <summary>
/// Middleware bắt lỗi toàn cục (Global Exception Handler) để chuẩn hóa phản hồi lỗi HTTP
/// </summary>
public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Đã xảy ra lỗi hệ thống: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var statusCode = HttpStatusCode.InternalServerError;
        object responsePayload;

        switch (exception)
        {
            case ValidationException validationEx:
                statusCode = HttpStatusCode.BadRequest;
                responsePayload = new
                {
                    status = (int)statusCode,
                    message = validationEx.Message,
                    errors = validationEx.Errors
                };
                break;

            case BusinessRuleException businessRuleEx:
                statusCode = HttpStatusCode.BadRequest;
                responsePayload = new
                {
                    status = (int)statusCode,
                    message = businessRuleEx.Message
                };
                break;

            case UnauthorizedException unauthorizedEx:
                statusCode = HttpStatusCode.Unauthorized;
                responsePayload = new
                {
                    status = (int)statusCode,
                    message = unauthorizedEx.Message
                };
                break;

            case ForbiddenException forbiddenEx:
                statusCode = HttpStatusCode.Forbidden;
                responsePayload = new
                {
                    status = (int)statusCode,
                    message = forbiddenEx.Message
                };
                break;

            case NotFoundException notFoundEx:
                statusCode = HttpStatusCode.NotFound;
                responsePayload = new
                {
                    status = (int)statusCode,
                    message = notFoundEx.Message
                };
                break;

            case ConflictException conflictEx:
                statusCode = HttpStatusCode.Conflict;
                responsePayload = new
                {
                    status = (int)statusCode,
                    message = conflictEx.Message
                };
                break;

            default:
                statusCode = HttpStatusCode.InternalServerError;
                responsePayload = new
                {
                    status = (int)statusCode,
                    message = "Đã xảy ra lỗi không xác định trên hệ thống máy chủ."
                };
                break;
        }

        context.Response.StatusCode = (int)statusCode;
        var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        return context.Response.WriteAsync(JsonSerializer.Serialize(responsePayload, jsonOptions));
    }
}
