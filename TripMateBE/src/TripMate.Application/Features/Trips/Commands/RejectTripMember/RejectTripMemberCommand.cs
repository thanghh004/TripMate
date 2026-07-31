using MediatR;

namespace TripMate.Application.Features.Trips.Commands.RejectTripMember;

public record RejectTripMemberCommand(Guid TripId, Guid MemberUserId, Guid OrganizerId) : IRequest<bool>;
