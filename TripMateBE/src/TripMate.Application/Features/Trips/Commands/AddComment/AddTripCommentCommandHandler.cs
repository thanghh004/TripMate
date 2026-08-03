using MediatR;
using TripMate.Application.DTOs.Trips;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Trips.Commands.AddComment;

public class AddTripCommentCommandHandler : IRequestHandler<AddTripCommentCommand, TripCommentDto>
{
    private readonly ITripRepository _tripRepository;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AddTripCommentCommandHandler(ITripRepository tripRepository, IUserRepository userRepository, IUnitOfWork unitOfWork)
    {
        _tripRepository = tripRepository;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<TripCommentDto> Handle(AddTripCommentCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Content))
        {
            throw new ArgumentException("Nội dung bình luận không được để trống.");
        }

        var trip = await _tripRepository.GetByIdWithDetailsAsync(request.TripId, cancellationToken);
        if (trip == null)
        {
            throw new KeyNotFoundException("Không tìm thấy chuyến đi.");
        }

        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
        {
            throw new KeyNotFoundException("Không tìm thấy thông tin người dùng.");
        }

        var comment = await _tripRepository.AddCommentAsync(request.TripId, request.UserId, request.Content.Trim(), cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new TripCommentDto
        {
            Id = comment.Id,
            TripId = comment.TripId,
            UserId = comment.UserId,
            UserName = user.FullName,
            UserAvatarUrl = user.AvatarUrl,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt
        };
    }
}
