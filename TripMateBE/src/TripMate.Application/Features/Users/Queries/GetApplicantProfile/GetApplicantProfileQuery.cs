using MediatR;
using TripMate.Application.DTOs.Users;

namespace TripMate.Application.Features.Users.Queries.GetApplicantProfile;

public record GetApplicantProfileQuery(Guid ApplicantUserId) : IRequest<ApplicantProfileDto>;
