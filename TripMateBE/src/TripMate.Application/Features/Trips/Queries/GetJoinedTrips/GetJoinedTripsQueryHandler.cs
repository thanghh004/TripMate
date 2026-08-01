using MediatR;
using TripMate.Application.DTOs.Trips;
using TripMate.Application.Helpers;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Trips.Queries.GetJoinedTrips;

public class GetJoinedTripsQueryHandler : IRequestHandler<GetJoinedTripsQuery, List<TripDto>>
{
    private readonly ITripRepository _tripRepository;
    private readonly IUnitOfWork _unitOfWork;

    public GetJoinedTripsQueryHandler(ITripRepository tripRepository, IUnitOfWork unitOfWork)
    {
        _tripRepository = tripRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<List<TripDto>> Handle(GetJoinedTripsQuery request, CancellationToken cancellationToken)
    {
        var trips = await _tripRepository.GetJoinedTripsAsync(request.UserId, cancellationToken);

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

        return trips.Select(t =>
        {
            var myMember = t.Members.FirstOrDefault(m => m.UserId == request.UserId);
            return new TripDto
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
                StartCountryId = t.StartCountryId,
                StartCityId = t.StartCityId,
                StartCityName = t.StartCity?.Name,
                Destination = t.Destination,
                DestinationCountryId = t.DestinationCountryId,
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
                CancellationReason = t.CancellationReason,
                ImageUrls = t.Images?.Select(i => i.ImageUrl).ToList() ?? new(),
                MyMemberStatus = myMember?.Status,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            };
        }).ToList();
    }
}
