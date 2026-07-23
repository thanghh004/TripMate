namespace TripMate.Domain.Interfaces;

/// <summary>
/// Hợp đồng Unit of Work quản lý các Transaction và tập trung lưu thay đổi CSDL
/// </summary>
public interface IUnitOfWork : IDisposable
{
    IRepository<T> Repository<T>() where T : class;
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
