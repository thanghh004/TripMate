using MediatR;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Trips.Commands.DeleteComment;

public class DeleteTripCommentCommandHandler : IRequestHandler<DeleteTripCommentCommand, bool>
{
    private readonly ITripRepository _tripRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteTripCommentCommandHandler(ITripRepository tripRepository, IUnitOfWork unitOfWork)
    {
        _tripRepository = tripRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteTripCommentCommand request, CancellationToken cancellationToken)
    {
        var comment = await _tripRepository.GetCommentByIdAsync(request.CommentId, cancellationToken);
        if (comment == null)
        {
            throw new KeyNotFoundException("Không tìm thấy bình luận.");
        }

        // Kiểm tra quyền xóa: Chính chủ bình luận, Trưởng đoàn (Host) của chuyến đi, hoặc Admin
        bool isCommentOwner = comment.UserId == request.UserId;
        bool isTripHost = comment.Trip != null && comment.Trip.OrganizerId == request.UserId;

        if (!isCommentOwner && !isTripHost && !request.IsAdmin)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền xóa bình luận này.");
        }

        _tripRepository.DeleteComment(comment);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
