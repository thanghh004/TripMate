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
            .AsNoTracking()
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
            .AsNoTracking()
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
            .AsNoTracking()
            .Where(t => t.Status == TripStatus.PendingReview)
            .Include(t => t.Category)
            .Include(t => t.StartCity)
            .Include(t => t.DestinationCity)
            .Include(t => t.Organizer)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Trip>> GetAllTripsForAdminAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Trips
            .AsNoTracking()
            .Include(t => t.Category)
            .Include(t => t.StartCity)
            .Include(t => t.DestinationCity)
            .Include(t => t.Organizer)
            .Include(t => t.Images)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> HasOverlappingTripAsync(Guid userId, DateTime startDate, DateTime endDate, Guid? excludeTripId = null, CancellationToken cancellationToken = default)
    {
        var activeStatuses = new List<TripStatus>
        {
            TripStatus.PendingReview,
            TripStatus.Open,
            TripStatus.Full,
            TripStatus.Ongoing
        };

        var query = _context.Trips
            .AsNoTracking()
            .Where(t => activeStatuses.Contains(t.Status))
            .Where(t => t.OrganizerId == userId || t.Members.Any(m => m.UserId == userId));

        if (excludeTripId.HasValue)
        {
            query = query.Where(t => t.Id != excludeTripId.Value);
        }

        // Logic trùng lịch: (StartA <= EndB) AND (EndA >= StartB)
        return await query.AnyAsync(t => t.StartDate.Date <= endDate.Date && t.EndDate.Date >= startDate.Date, cancellationToken);
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
