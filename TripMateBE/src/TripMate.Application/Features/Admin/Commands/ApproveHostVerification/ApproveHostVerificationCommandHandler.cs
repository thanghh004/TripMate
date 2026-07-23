using MediatR;
using TripMate.Domain.Enums;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Admin.Commands.ApproveHostVerification;

/// <summary>
/// Handler xử lý Admin phê duyệt quyền tạo chuyến (Host Verification)
/// </summary>
public class ApproveHostVerificationCommandHandler : IRequestHandler<ApproveHostVerificationCommand, bool>
{
    private readonly IUserRepository _userRepository;

    public ApproveHostVerificationCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<bool> Handle(ApproveHostVerificationCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException("Không tìm thấy người dùng.");
        }

        user.HostVerificationStatus = HostVerificationStatus.Approved;
        user.UpdatedAt = DateTime.UtcNow;

        var result = await _userRepository.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(" ", result.Errors.Select(e => e.Description));
            throw new BusinessRuleException($"Phê duyệt thất bại: {errors}");
        }

        return true;
    }
}
