using MediatR;
using TripMate.Application.DTOs.Trips;
using TripMate.Domain.Entities;
using TripMate.Domain.Enums;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Trips.Commands.UpdateTrip;

public class UpdateTripCommandHandler : IRequestHandler<UpdateTripCommand, TripDto>
{
    private readonly ITripRepository _tripRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateTripCommandHandler(ITripRepository tripRepository, IUnitOfWork unitOfWork)
    {
        _tripRepository = tripRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<TripDto> Handle(UpdateTripCommand request, CancellationToken cancellationToken)
    {
        var trip = await _tripRepository.GetByIdWithDetailsAsync(request.TripId, cancellationToken);
        if (trip == null)
            throw new NotFoundException("Không tìm thấy chuyến đi.");

        // Rule: Chỉ Organizer mới có quyền chỉnh sửa chuyến đi
        if (trip.OrganizerId != request.UserId)
            throw new BusinessRuleException("Bạn không phải là Trưởng đoàn của chuyến đi này.");

        // Rule: Không cho sửa khi chuyến đi đang diễn ra hoặc đã hoàn thành/hủy
        if (trip.Status == TripStatus.Ongoing || trip.Status == TripStatus.Completed || trip.Status == TripStatus.Cancelled)
            throw new BusinessRuleException("Không thể chỉnh sửa chuyến đi đang diễn ra, đã hoàn thành hoặc đã bị hủy.");

        var dto = request.Dto;

        trip.CategoryId = dto.CategoryId;
        trip.Title = dto.Title.Trim();
        trip.Description = dto.Description?.Trim();
        trip.StartLocation = dto.StartLocation.Trim();
        trip.StartCountryId = dto.StartCountryId;
        trip.StartCityId = dto.StartCityId;
        trip.Destination = dto.Destination.Trim();
        trip.DestinationCountryId = dto.DestinationCountryId;
        trip.DestinationCityId = dto.DestinationCityId;
        trip.CoverImageUrl = dto.CoverImageUrl?.Trim();
        trip.StartDate = dto.StartDate;
        trip.EndDate = dto.EndDate;
        trip.RegistrationDeadline = dto.RegistrationDeadline;
        trip.MaxMembers = dto.MaxMembers;
        trip.EstimatedCost = dto.EstimatedCost;
        trip.CostNote = dto.CostNote?.Trim();
        trip.Requirements = dto.Requirements?.Trim();
        trip.MinAge = dto.MinAge;
        trip.MaxAge = dto.MaxAge;
        trip.PreferredGender = dto.PreferredGender?.Trim();
        trip.UpdatedAt = DateTime.UtcNow;

        _tripRepository.Update(trip);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var updatedTrip = await _tripRepository.GetByIdWithDetailsAsync(trip.Id, cancellationToken);

        return new TripDto
        {
            Id = updatedTrip!.Id,
            OrganizerId = updatedTrip.OrganizerId,
            OrganizerName = updatedTrip.Organizer?.FullName ?? string.Empty,
            OrganizerAvatarUrl = updatedTrip.Organizer?.AvatarUrl,
            CategoryId = updatedTrip.CategoryId,
            CategoryName = updatedTrip.Category?.Name ?? string.Empty,
            Title = updatedTrip.Title,
            Description = updatedTrip.Description,
            StartLocation = updatedTrip.StartLocation,
            StartCityId = updatedTrip.StartCityId,
            StartCityName = updatedTrip.StartCity?.Name,
            Destination = updatedTrip.Destination,
            DestinationCityId = updatedTrip.DestinationCityId,
            DestinationCityName = updatedTrip.DestinationCity?.Name,
            CoverImageUrl = updatedTrip.CoverImageUrl,
            StartDate = updatedTrip.StartDate,
            EndDate = updatedTrip.EndDate,
            RegistrationDeadline = updatedTrip.RegistrationDeadline,
            MaxMembers = updatedTrip.MaxMembers,
            CurrentMembers = updatedTrip.CurrentMembers,
            EstimatedCost = updatedTrip.EstimatedCost,
            CostNote = updatedTrip.CostNote,
            Requirements = updatedTrip.Requirements,
            MinAge = updatedTrip.MinAge,
            MaxAge = updatedTrip.MaxAge,
            PreferredGender = updatedTrip.PreferredGender,
            Status = updatedTrip.Status,
            ModerationNote = updatedTrip.ModerationNote,
            ImageUrls = updatedTrip.Images?.Select(i => i.ImageUrl).ToList() ?? new(),
            CreatedAt = updatedTrip.CreatedAt,
            UpdatedAt = updatedTrip.UpdatedAt
        };
    }
}
