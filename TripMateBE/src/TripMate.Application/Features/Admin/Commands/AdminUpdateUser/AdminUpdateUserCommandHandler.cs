using MediatR;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Admin.Commands.AdminUpdateUser;

/// <summary>
/// Handler xử lý Admin cập nhật các cài đặt quản trị của người dùng
/// </summary>
public class AdminUpdateUserCommandHandler : IRequestHandler<AdminUpdateUserCommand, bool>
{
    private readonly IUserRepository _userRepository;

    public AdminUpdateUserCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<bool> Handle(AdminUpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException("Không tìm thấy người dùng.");
        }

        // Cập nhật các quyền và trạng thái quản trị (Giữ nguyên các thông tin cá nhân)
        user.Role = request.Role;
        user.Status = request.Status;
        user.HostVerificationStatus = request.HostVerificationStatus;
        user.UpdatedAt = DateTime.UtcNow;

        var result = await _userRepository.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(" ", result.Errors.Select(e => e.Description));
            throw new BusinessRuleException($"Cập nhật thất bại: {errors}");
        }

        return true;
    }
}
