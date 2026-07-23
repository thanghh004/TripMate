using System.Collections;
using TripMate.Domain.Interfaces;
using TripMate.Infrastructure.Data;

namespace TripMate.Infrastructure.Repositories;

/// <summary>
/// Triển khai Unit of Work quản lý các Transaction và tập trung lưu thay đổi CSDL
/// </summary>
public class UnitOfWork : IUnitOfWork
{
    private readonly TripMateDbContext _context;
    private Hashtable? _repositories;
    private bool _disposed = false;

    public UnitOfWork(TripMateDbContext context)
    {
        _context = context;
    }

    public IRepository<T> Repository<T>() where T : class
    {
        if (_repositories == null)
        {
            _repositories = new Hashtable();
        }

        var type = typeof(T).Name;

        if (!_repositories.ContainsKey(type))
        {
            var repositoryType = typeof(GenericRepository<>);
            var repositoryInstance = Activator.CreateInstance(repositoryType.MakeGenericType(typeof(T)), _context);
            _repositories.Add(type, repositoryInstance);
        }

        return (IRepository<T>)_repositories[type]!;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed)
        {
            if (disposing)
            {
                _context.Dispose();
            }
            _disposed = true;
        }
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }
}
