using MediatR;
using TripMate.Application.DTOs.Trips;
using TripMate.Domain.Interfaces;

using TripMate.Application.Helpers;

namespace TripMate.Application.Features.Trips.Queries.GetMyTrips;

public class GetMyTripsQueryHandler : IRequestHandler<GetMyTripsQuery, List<TripDto>>
{
    private readonly ITripRepository _tripRepository;
    private readonly IUnitOfWork _unitOfWork;

    public GetMyTripsQueryHandler(ITripRepository tripRepository, IUnitOfWork unitOfWork)
    {
        _tripRepository = tripRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<List<TripDto>> Handle(GetMyTripsQuery request, CancellationToken cancellationToken)
    {
        var trips = await _tripRepository.GetMyTripsAsync(request.UserId, cancellationToken);

        bool hasAnyChanges = false;
        foreach (var t in trips)
        {
            if (TripStatusAutoUpdater.UpdateStatusIfNeeded(t))
            {
                hasAnyChanges = true;
            }
        }

        if (hasAnyChanges)
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

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
