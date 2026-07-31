using MediatR;
using TripMate.Application.DTOs.Users;
using TripMate.Domain.Enums;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Users.Queries.GetHostPublicProfile;

public class GetHostPublicProfileQueryHandler : IRequestHandler<GetHostPublicProfileQuery, HostPublicProfileDto>
{
    private readonly IUserRepository _userRepository;
    private readonly ITripRepository _tripRepository;

    public GetHostPublicProfileQueryHandler(IUserRepository userRepository, ITripRepository tripRepository)
    {
        _userRepository = userRepository;
        _tripRepository = tripRepository;
    }

    public async Task<HostPublicProfileDto> Handle(GetHostPublicProfileQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.HostId, cancellationToken);
        if (user == null)
            throw new NotFoundException("Không tìm thấy thông tin người dùng.");

        // Thống kê danh sách chuyến đi do Host tạo
        var trips = await _tripRepository.GetMyTripsAsync(request.HostId, cancellationToken);

        int total = trips.Count;
        int completed = trips.Count(t => t.Status == TripStatus.Completed);
        int uncompleted = total - completed;

        return new HostPublicProfileDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            AvatarUrl = user.AvatarUrl,
            Rating = 5.0,
            TotalCreatedTrips = total,
            CompletedTripsCount = completed,
            UncompletedTripsCount = uncompleted
        };
    }
}
