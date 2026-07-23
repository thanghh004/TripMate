namespace TripMate.Domain.Exceptions;

/// <summary>
/// Ngoại lệ ném ra khi vi phạm các quy tắc nghiệp vụ hệ thống (Map sang HTTP 400 Bad Request)
/// </summary>
public class BusinessRuleException : DomainException
{
    public BusinessRuleException(string message) : base(message)
    {
    }
}
