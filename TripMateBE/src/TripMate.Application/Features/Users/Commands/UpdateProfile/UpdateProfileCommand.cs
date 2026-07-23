using MediatR;

namespace TripMate.Application.Features.Users.Commands.UpdateProfile;

/// <summary>
/// Command cập nhật thông tin cá nhân của người dùng
/// </summary>
public record UpdateProfileCommand(
    Guid UserId,
    string FullName,
    string? PhoneNumber,
    string? Gender,
    DateTime? BirthDate,
    string? Bio,
    string? AvatarUrl,
    string? IdentityCardFrontUrl,
    string? IdentityCardBackUrl
) : IRequest<bool>;
