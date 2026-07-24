using MediatR;
using TripMate.Application.DTOs.Trips;
using TripMate.Domain.Enums;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Trips.Commands.RejectTrip;

public class RejectTripCommandHandler : IRequestHandler<RejectTripCommand, TripDto>
{
    private readonly ITripRepository _tripRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RejectTripCommandHandler(ITripRepository tripRepository, IUnitOfWork unitOfWork)
    {
        _tripRepository = tripRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<TripDto> Handle(RejectTripCommand request, CancellationToken cancellationToken)
    {
        var trip = await _tripRepository.GetByIdWithDetailsAsync(request.TripId, cancellationToken);
        if (trip == null)
            throw new NotFoundException("Không tìm thấy chuyến đi.");

        if (trip.Status != TripStatus.PendingReview)
            throw new BusinessRuleException($"Chuyến đi đang ở trạng thái '{trip.Status}', chỉ từ chối được chuyến đi đang ở trạng thái Chờ duyệt (PendingReview).");

        trip.Status = TripStatus.Cancelled;
        trip.ModerationNote = request.Dto.Reason.Trim();
        trip.UpdatedAt = DateTime.UtcNow;

        _tripRepository.Update(trip);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var rejectedTrip = await _tripRepository.GetByIdWithDetailsAsync(trip.Id, cancellationToken);

        return new TripDto
        {
            Id = rejectedTrip!.Id,
            OrganizerId = rejectedTrip.OrganizerId,
            OrganizerName = rejectedTrip.Organizer?.FullName ?? string.Empty,
            OrganizerAvatarUrl = rejectedTrip.Organizer?.AvatarUrl,
            CategoryId = rejectedTrip.CategoryId,
            CategoryName = rejectedTrip.Category?.Name ?? string.Empty,
            Title = rejectedTrip.Title,
            Description = rejectedTrip.Description,
            StartLocation = rejectedTrip.StartLocation,
            StartCityId = rejectedTrip.StartCityId,
            StartCityName = rejectedTrip.StartCity?.Name,
            Destination = rejectedTrip.Destination,
            DestinationCityId = rejectedTrip.DestinationCityId,
            DestinationCityName = rejectedTrip.DestinationCity?.Name,
            CoverImageUrl = rejectedTrip.CoverImageUrl,
            StartDate = rejectedTrip.StartDate,
            EndDate = rejectedTrip.EndDate,
            RegistrationDeadline = rejectedTrip.RegistrationDeadline,
            MaxMembers = rejectedTrip.MaxMembers,
            CurrentMembers = rejectedTrip.CurrentMembers,
            EstimatedCost = rejectedTrip.EstimatedCost,
            CostNote = rejectedTrip.CostNote,
            Requirements = rejectedTrip.Requirements,
            MinAge = rejectedTrip.MinAge,
            MaxAge = rejectedTrip.MaxAge,
            PreferredGender = rejectedTrip.PreferredGender,
            Status = rejectedTrip.Status,
            ModerationNote = rejectedTrip.ModerationNote,
            ImageUrls = rejectedTrip.Images?.Select(i => i.ImageUrl).ToList() ?? new(),
            CreatedAt = rejectedTrip.CreatedAt,
            UpdatedAt = rejectedTrip.UpdatedAt
        };
    }
}
