namespace TripMate.Domain.Exceptions;

/// <summary>
/// Ngoại lệ ném ra khi không tìm thấy tài nguyên yêu cầu (Map sang HTTP 404 Not Found)
/// </summary>
public class NotFoundException : DomainException
{
    public NotFoundException(string message) : base(message)
    {
    }

    public NotFoundException(string name, object key) 
        : base($"Tài nguyên '{name}' với khóa ({key}) không tồn tại.")
    {
    }
}
