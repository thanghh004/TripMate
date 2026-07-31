using MediatR;
using TripMate.Application.DTOs.Users;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Users.Queries.GetApplicantProfile;

public class GetApplicantProfileQueryHandler : IRequestHandler<GetApplicantProfileQuery, ApplicantProfileDto>
{
    private readonly IUserRepository _userRepository;

    public GetApplicantProfileQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<ApplicantProfileDto> Handle(GetApplicantProfileQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.ApplicantUserId, cancellationToken);
        if (user == null)
            throw new NotFoundException("Không tìm thấy thông tin người dùng.");

        return new ApplicantProfileDto
        {
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email!,
            Gender = user.Gender,
            BirthDate = user.BirthDate,
            AvatarUrl = user.AvatarUrl,
            AvgRating = user.AvgRating > 0 ? user.AvgRating : 5.0m
        };
    }
}
