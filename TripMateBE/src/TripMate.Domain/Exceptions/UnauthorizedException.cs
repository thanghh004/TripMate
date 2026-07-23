namespace TripMate.Domain.Exceptions;

/// <summary>
/// Ngoại lệ ném ra khi người dùng không có quyền thực hiện hành động này (Map sang HTTP 401 Unauthorized hoặc 403 Forbidden)
/// </summary>
public class UnauthorizedException : DomainException
{
    public UnauthorizedException(string message) : base(message)
    {
    }
}
