using MediatR;
using TripMate.Application.DTOs.Trips;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Trips.Queries.GetPendingTrips;

public class GetPendingTripsQueryHandler : IRequestHandler<GetPendingTripsQuery, List<TripDto>>
{
    private readonly ITripRepository _tripRepository;

    public GetPendingTripsQueryHandler(ITripRepository tripRepository)
    {
        _tripRepository = tripRepository;
    }

    public async Task<List<TripDto>> Handle(GetPendingTripsQuery request, CancellationToken cancellationToken)
    {
        var trips = await _tripRepository.GetPendingTripsAsync(cancellationToken);

        return trips.Select(t => new TripDto
        {
            Id = t.Id,
            OrganizerId = t.OrganizerId,
            OrganizerName = t.Organizer?.FullName ?? string.Empty,
            OrganizerAvatarUrl = t.Organizer?.AvatarUrl,
            CategoryId = t.CategoryId,
            CategoryName = t.Category?.Name ?? string.Empty,
            Title = t.Title,
            Description = t.Description,
            StartLocation = t.StartLocation,
            StartCityId = t.StartCityId,
            StartCityName = t.StartCity?.Name,
            Destination = t.Destination,
            DestinationCityId = t.DestinationCityId,
            DestinationCityName = t.DestinationCity?.Name,
            CoverImageUrl = t.CoverImageUrl,
            StartDate = t.StartDate,
            EndDate = t.EndDate,
            RegistrationDeadline = t.RegistrationDeadline,
            MaxMembers = t.MaxMembers,
            CurrentMembers = t.CurrentMembers,
            EstimatedCost = t.EstimatedCost,
            CostNote = t.CostNote,
            Requirements = t.Requirements,
            MinAge = t.MinAge,
            MaxAge = t.MaxAge,
            PreferredGender = t.PreferredGender,
            Status = t.Status,
            ModerationNote = t.ModerationNote,
            ImageUrls = t.Images?.Select(i => i.ImageUrl).ToList() ?? new(),
            CreatedAt = t.CreatedAt,
            UpdatedAt = t.UpdatedAt
        }).ToList();
    }
}
