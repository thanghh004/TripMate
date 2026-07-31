using MediatR;
using TripMate.Application.DTOs.Users;

namespace TripMate.Application.Features.Users.Queries.GetHostPublicProfile;

public record GetHostPublicProfileQuery(Guid HostId) : IRequest<HostPublicProfileDto>;
