namespace TripMate.Domain.Exceptions;

/// <summary>
/// Ngoại lệ ném ra khi xảy ra xung đột dữ liệu, ví dụ trùng Email/SĐT đã tồn tại (Map sang HTTP 409 Conflict)
/// </summary>
public class ConflictException : DomainException
{
    public ConflictException(string message) : base(message)
    {
    }
}
