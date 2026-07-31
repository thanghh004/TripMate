using MediatR;

namespace TripMate.Application.Features.Trips.Commands.ApproveTripMember;

public record ApproveTripMemberCommand(Guid TripId, Guid MemberUserId, Guid OrganizerId) : IRequest<bool>;
