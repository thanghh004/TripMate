using System.Linq.Expressions;

namespace TripMate.Domain.Interfaces;

/// <summary>
/// Hợp đồng Generic Repository cho các thao tác CRUD cơ bản
/// </summary>
/// <typeparam name="T">Thực thể kế thừa lớp hoặc là một class</typeparam>
public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(Guid id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<IEnumerable<T>> GetAllWithDeletedAsync();
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
    Task<IEnumerable<T>> FindWithDeletedAsync(Expression<Func<T, bool>> predicate);
    Task AddAsync(T entity);
    void Update(T entity);
    void Delete(T entity);
    void SoftDelete(T entity);
}
