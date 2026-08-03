using MediatR;
using TripMate.Application.DTOs.Trips;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Trips.Queries.GetComments;

public class GetTripCommentsQueryHandler : IRequestHandler<GetTripCommentsQuery, List<TripCommentDto>>
{
    private readonly ITripRepository _tripRepository;

    public GetTripCommentsQueryHandler(ITripRepository tripRepository)
    {
        _tripRepository = tripRepository;
    }

    public async Task<List<TripCommentDto>> Handle(GetTripCommentsQuery request, CancellationToken cancellationToken)
    {
        var comments = await _tripRepository.GetCommentsAsync(request.TripId, cancellationToken);

        return comments.Select(c => new TripCommentDto
        {
            Id = c.Id,
            TripId = c.TripId,
            UserId = c.UserId,
            UserName = c.User?.FullName ?? string.Empty,
            UserAvatarUrl = c.User?.AvatarUrl,
            Content = c.Content,
            CreatedAt = c.CreatedAt
        }).ToList();
    }
}
