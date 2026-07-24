using MediatR;
using TripMate.Application.DTOs.Trips;
using TripMate.Domain.Enums;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Trips.Commands.ApproveTrip;

public class ApproveTripCommandHandler : IRequestHandler<ApproveTripCommand, TripDto>
{
    private readonly ITripRepository _tripRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ApproveTripCommandHandler(ITripRepository tripRepository, IUnitOfWork unitOfWork)
    {
        _tripRepository = tripRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<TripDto> Handle(ApproveTripCommand request, CancellationToken cancellationToken)
    {
        var trip = await _tripRepository.GetByIdWithDetailsAsync(request.TripId, cancellationToken);
        if (trip == null)
            throw new NotFoundException("Không tìm thấy chuyến đi.");

        if (trip.Status != TripStatus.PendingReview)
            throw new BusinessRuleException($"Chuyến đi đang ở trạng thái '{trip.Status}', chỉ phê duyệt được chuyến đi đang ở trạng thái Chờ duyệt (PendingReview).");

        trip.Status = TripStatus.Open;
        trip.ModerationNote = null;
        trip.UpdatedAt = DateTime.UtcNow;

        _tripRepository.Update(trip);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var approvedTrip = await _tripRepository.GetByIdWithDetailsAsync(trip.Id, cancellationToken);

        return new TripDto
        {
            Id = approvedTrip!.Id,
            OrganizerId = approvedTrip.OrganizerId,
            OrganizerName = approvedTrip.Organizer?.FullName ?? string.Empty,
            OrganizerAvatarUrl = approvedTrip.Organizer?.AvatarUrl,
            CategoryId = approvedTrip.CategoryId,
            CategoryName = approvedTrip.Category?.Name ?? string.Empty,
            Title = approvedTrip.Title,
            Description = approvedTrip.Description,
            StartLocation = approvedTrip.StartLocation,
            StartCityId = approvedTrip.StartCityId,
            StartCityName = approvedTrip.StartCity?.Name,
            Destination = approvedTrip.Destination,
            DestinationCityId = approvedTrip.DestinationCityId,
            DestinationCityName = approvedTrip.DestinationCity?.Name,
            CoverImageUrl = approvedTrip.CoverImageUrl,
            StartDate = approvedTrip.StartDate,
            EndDate = approvedTrip.EndDate,
            RegistrationDeadline = approvedTrip.RegistrationDeadline,
            MaxMembers = approvedTrip.MaxMembers,
            CurrentMembers = approvedTrip.CurrentMembers,
            EstimatedCost = approvedTrip.EstimatedCost,
            CostNote = approvedTrip.CostNote,
            Requirements = approvedTrip.Requirements,
            MinAge = approvedTrip.MinAge,
            MaxAge = approvedTrip.MaxAge,
            PreferredGender = approvedTrip.PreferredGender,
            Status = approvedTrip.Status,
            ModerationNote = approvedTrip.ModerationNote,
            ImageUrls = approvedTrip.Images?.Select(i => i.ImageUrl).ToList() ?? new(),
            CreatedAt = approvedTrip.CreatedAt,
            UpdatedAt = approvedTrip.UpdatedAt
        };
    }
}
