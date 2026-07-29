using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using TripMate.Domain.Common;
using TripMate.Domain.Interfaces;
using TripMate.Infrastructure.Data;

namespace TripMate.Infrastructure.Repositories;

/// <summary>
/// Triển khai Generic Repository cho EF Core
/// </summary>
public class GenericRepository<T> : IRepository<T> where T : class
{
    protected readonly TripMateDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public GenericRepository(TripMateDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public async Task<T?> GetByIdAsync(Guid id)
    {
        return await _dbSet.AsNoTracking().FirstOrDefaultAsync(e => EF.Property<Guid>(e, "Id") == id);
    }

    public async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _dbSet.AsNoTracking().ToListAsync();
    }

    public async Task<(IEnumerable<T> Items, int TotalCount)> GetPagedAsync(int pageIndex, int pageSize, Expression<Func<T, bool>>? predicate = null)
    {
        IQueryable<T> query = _dbSet.AsNoTracking();

        if (predicate != null)
        {
            query = query.Where(predicate);
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<IEnumerable<T>> GetAllWithDeletedAsync()
    {
        return await _dbSet.IgnoreQueryFilters().AsNoTracking().ToListAsync();
    }

    public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
    {
        return await _dbSet.AsNoTracking().Where(predicate).ToListAsync();
    }

    public async Task<IEnumerable<T>> FindWithDeletedAsync(Expression<Func<T, bool>> predicate)
    {
        return await _dbSet.IgnoreQueryFilters().AsNoTracking().Where(predicate).ToListAsync();
    }

    public async Task AddAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
    }

    public void Update(T entity)
    {
        _dbSet.Attach(entity);
        _context.Entry(entity).State = EntityState.Modified;
    }

    public void Delete(T entity)
    {
        _dbSet.Remove(entity);
    }

    public void SoftDelete(T entity)
    {
        if (entity is ISoftDelete softDeleteEntity)
        {
            softDeleteEntity.IsDeleted = true;
            _context.Entry(entity).State = EntityState.Modified;
        }
        else
        {
            Delete(entity);
        }
    }
}
