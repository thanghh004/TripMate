using MediatR;
using TripMate.Application.DTOs.Trips;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Trips.Queries.GetTripById;

/// <summary>
/// Handler xử lý lấy chi tiết chuyến đi theo ID
/// </summary>
public class GetTripByIdQueryHandler : IRequestHandler<GetTripByIdQuery, TripDto>
{
    private readonly ITripRepository _tripRepository;

    public GetTripByIdQueryHandler(ITripRepository tripRepository)
    {
        _tripRepository = tripRepository;
    }

    public async Task<TripDto> Handle(GetTripByIdQuery request, CancellationToken cancellationToken)
    {
        var t = await _tripRepository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (t == null)
        {
            throw new NotFoundException($"Không tìm thấy chuyến đi với ID: {request.Id}");
        }

        var members = new List<TripMemberDetailDto>();
        if (t.Members != null)
        {
            foreach (var m in t.Members)
            {
                members.Add(new TripMemberDetailDto
                {
                    UserId = m.UserId,
                    FullName = m.User?.FullName ?? string.Empty,
                    AvatarUrl = m.User?.AvatarUrl,
                    Role = m.Role,
                    Status = m.Status,
                    JoinedAt = m.JoinedAt
                });
            }
        }

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
            Members = members,
            CreatedAt = t.CreatedAt,
            UpdatedAt = t.UpdatedAt
        };
    }
}
