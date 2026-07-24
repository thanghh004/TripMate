using MediatR;
using TripMate.Application.DTOs.Trips;
using TripMate.Domain.Entities;
using TripMate.Domain.Enums;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.Trips.Commands.CreateTrip;

public class CreateTripCommandHandler : IRequestHandler<CreateTripCommand, TripDto>
{
    private readonly ITripRepository _tripRepository;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateTripCommandHandler(
        ITripRepository tripRepository,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork)
    {
        _tripRepository = tripRepository;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<TripDto> Handle(CreateTripCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.OrganizerId, cancellationToken);
        if (user == null)
            throw new NotFoundException("Không tìm thấy thông tin tài khoản người dùng.");

        // Rule: Kiểm tra chi tiết trạng thái duyệt quyền tạo chuyến (HostVerificationStatus)
        if (user.HostVerificationStatus != HostVerificationStatus.Approved)
        {
            if (user.HostVerificationStatus == HostVerificationStatus.Pending)
            {
                throw new BusinessRuleException("Tài khoản của bạn đang chờ Admin xét duyệt quyền tạo chuyến. Vui lòng quay lại sau!");
            }

            if (user.HostVerificationStatus == HostVerificationStatus.Rejected)
            {
                throw new BusinessRuleException("Yêu cầu cấp quyền tạo chuyến của bạn đã bị từ chối. Vui lòng quay lại sau!");
            }

            if (user.HostVerificationStatus == HostVerificationStatus.Blocked)
            {
                throw new BusinessRuleException("Quyền tạo chuyến đi của bạn đã bị khóa vĩnh viễn bởi Quản trị viên.");
            }

            throw new BusinessRuleException("Bạn chưa đăng ký quyền Tạo chuyến. Vui lòng gửi yêu cầu trong phần cài đặt!");
        }

        var dto = request.Dto;

        var trip = new Trip
        {
            OrganizerId = request.OrganizerId,
            CategoryId = dto.CategoryId,
            Title = dto.Title.Trim(),
            Description = dto.Description?.Trim(),
            StartLocation = dto.StartLocation.Trim(),
            StartCountryId = dto.StartCountryId,
            StartCityId = dto.StartCityId,
            Destination = dto.Destination.Trim(),
            DestinationCountryId = dto.DestinationCountryId,
            DestinationCityId = dto.DestinationCityId,
            CoverImageUrl = dto.CoverImageUrl?.Trim(),
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            RegistrationDeadline = dto.RegistrationDeadline,
            MaxMembers = dto.MaxMembers,
            CurrentMembers = 1, // Mặc định Organizer là 1 thành viên
            EstimatedCost = dto.EstimatedCost,
            CostNote = dto.CostNote?.Trim(),
            Requirements = dto.Requirements?.Trim(),
            MinAge = dto.MinAge,
            MaxAge = dto.MaxAge,
            PreferredGender = dto.PreferredGender?.Trim(),
            Status = TripStatus.PendingReview
        };

        if (dto.ImageUrls != null && dto.ImageUrls.Count > 0)
        {
            foreach (var url in dto.ImageUrls)
            {
                if (!string.IsNullOrWhiteSpace(url))
                {
                    trip.Images.Add(new TripImage
                    {
                        ImageUrl = url.Trim()
                    });
                }
            }
        }

        await _tripRepository.AddAsync(trip, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var createdTrip = await _tripRepository.GetByIdWithDetailsAsync(trip.Id, cancellationToken);

        return new TripDto
        {
            Id = createdTrip!.Id,
            OrganizerId = createdTrip.OrganizerId,
            OrganizerName = createdTrip.Organizer?.FullName ?? string.Empty,
            OrganizerAvatarUrl = createdTrip.Organizer?.AvatarUrl,
            CategoryId = createdTrip.CategoryId,
            CategoryName = createdTrip.Category?.Name ?? string.Empty,
            Title = createdTrip.Title,
            Description = createdTrip.Description,
            StartLocation = createdTrip.StartLocation,
            StartCityId = createdTrip.StartCityId,
            StartCityName = createdTrip.StartCity?.Name,
            Destination = createdTrip.Destination,
            DestinationCityId = createdTrip.DestinationCityId,
            DestinationCityName = createdTrip.DestinationCity?.Name,
            CoverImageUrl = createdTrip.CoverImageUrl,
            StartDate = createdTrip.StartDate,
            EndDate = createdTrip.EndDate,
            RegistrationDeadline = createdTrip.RegistrationDeadline,
            MaxMembers = createdTrip.MaxMembers,
            CurrentMembers = createdTrip.CurrentMembers,
            EstimatedCost = createdTrip.EstimatedCost,
            CostNote = createdTrip.CostNote,
            Requirements = createdTrip.Requirements,
            MinAge = createdTrip.MinAge,
            MaxAge = createdTrip.MaxAge,
            PreferredGender = createdTrip.PreferredGender,
            Status = createdTrip.Status,
            ModerationNote = createdTrip.ModerationNote,
            ImageUrls = createdTrip.Images?.Select(i => i.ImageUrl).ToList() ?? new(),
            CreatedAt = createdTrip.CreatedAt,
            UpdatedAt = createdTrip.UpdatedAt
        };
    }
}
