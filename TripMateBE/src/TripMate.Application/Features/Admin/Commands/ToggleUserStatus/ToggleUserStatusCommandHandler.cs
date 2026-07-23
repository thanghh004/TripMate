using MediatR;
using TripMate.Domain.Enums;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Admin.Commands.ToggleUserStatus;

/// <summary>
/// Handler xử lý đảo trạng thái Khóa / Mở khóa tài khoản người dùng
/// </summary>
public class ToggleUserStatusCommandHandler : IRequestHandler<ToggleUserStatusCommand, bool>
{
    private readonly IUserRepository _userRepository;

    public ToggleUserStatusCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<bool> Handle(ToggleUserStatusCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException("Không tìm thấy người dùng.");
        }

        // Đảo trạng thái giữa Active và Suspended
        user.Status = user.Status == UserStatus.Active ? UserStatus.Suspended : UserStatus.Active;
        user.UpdatedAt = DateTime.UtcNow;

        var result = await _userRepository.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(" ", result.Errors.Select(e => e.Description));
            throw new BusinessRuleException($"Cập nhật trạng thái thất bại: {errors}");
        }

        return true;
    }
}
