namespace TripMate.Domain.Exceptions;

/// <summary>
/// Ngoại lệ ném ra khi xác thực đầu vào thất bại (Map sang HTTP 400 Bad Request kèm chi tiết lỗi các trường)
/// </summary>
public class ValidationException : DomainException
{
    /// <summary>
    /// Danh sách lỗi xác thực chi tiết theo từng trường (Field -> Array of Error Messages)
    /// </summary>
    public IDictionary<string, string[]> Errors { get; }

    public ValidationException() 
        : base("Đã xảy ra một hoặc nhiều lỗi xác thực dữ liệu.")
    {
        Errors = new Dictionary<string, string[]>();
    }

    public ValidationException(IDictionary<string, string[]> errors) 
        : base("Đã xảy ra một hoặc nhiều lỗi xác thực dữ liệu.")
    {
        Errors = errors;
    }
}
