namespace TripMate.Domain.Exceptions;

/// <summary>
/// Ngoại lệ ném ra khi người dùng không có đủ quyền truy cập (HTTP 403 Forbidden)
/// </summary>
public class ForbiddenException : DomainException
{
    public ForbiddenException(string message) : base(message)
    {
    }
}
