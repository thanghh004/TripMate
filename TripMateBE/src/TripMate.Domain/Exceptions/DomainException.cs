namespace TripMate.Domain.Exceptions;

/// <summary>
/// Lớp ngoại lệ cơ sở cho toàn bộ các lỗi nghiệp vụ trong hệ thống TripMate
/// </summary>
public abstract class DomainException : Exception
{
    protected DomainException(string message) : base(message)
    {
    }
}
