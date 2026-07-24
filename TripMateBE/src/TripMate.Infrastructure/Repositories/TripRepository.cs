using Microsoft.EntityFrameworkCore;
using TripMate.Domain.Entities;
using TripMate.Domain.Enums;
using TripMate.Domain.Interfaces;
using TripMate.Infrastructure.Data;

namespace TripMate.Infrastructure.Repositories;

/// <summary>
/// Thực thi ITripRepository ở lớp Infrastructure sử dụng EF Core
/// </summary>
public class TripRepository : ITripRepository
{
    private readonly TripMateDbContext _context;

    public TripRepository(TripMateDbContext context)
    {
        _context = context;
    }

    public async Task<Trip?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Trips
            .Include(t => t.Category)
            .Include(t => t.StartCity)
            .Include(t => t.DestinationCity)
            .Include(t => t.Organizer)
            .Include(t => t.Images)
            .Include(t => t.Members)
                .ThenInclude(m => m.User)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<List<Trip>> GetMyTripsAsync(Guid organizerId, CancellationToken cancellationToken = default)
    {
        return await _context.Trips
            .Where(t => t.OrganizerId == organizerId)
            .Include(t => t.Category)
            .Include(t => t.StartCity)
            .Include(t => t.DestinationCity)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Trip>> GetPendingTripsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Trips
            .Where(t => t.Status == TripStatus.PendingReview)
            .Include(t => t.Category)
            .Include(t => t.StartCity)
            .Include(t => t.DestinationCity)
            .Include(t => t.Organizer)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Trip trip, CancellationToken cancellationToken = default)
    {
        await _context.Trips.AddAsync(trip, cancellationToken);
    }

    public void Update(Trip trip)
    {
        _context.Trips.Update(trip);
    }
}
