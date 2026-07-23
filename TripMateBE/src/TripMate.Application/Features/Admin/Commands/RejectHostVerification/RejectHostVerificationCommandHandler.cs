using MediatR;
using TripMate.Domain.Enums;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Admin.Commands.RejectHostVerification;

/// <summary>
/// Handler xử lý Admin từ chối quyền tạo chuyến (Host Verification)
/// </summary>
public class RejectHostVerificationCommandHandler : IRequestHandler<RejectHostVerificationCommand, bool>
{
    private readonly IUserRepository _userRepository;

    public RejectHostVerificationCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<bool> Handle(RejectHostVerificationCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException("Không tìm thấy người dùng.");
        }

        user.HostVerificationStatus = HostVerificationStatus.Rejected;
        user.HostRejectReason = request.Reason?.Trim();
        user.UpdatedAt = DateTime.UtcNow;

        var result = await _userRepository.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(" ", result.Errors.Select(e => e.Description));
            throw new BusinessRuleException($"Từ chối thất bại: {errors}");
        }

        return true;
    }
}
