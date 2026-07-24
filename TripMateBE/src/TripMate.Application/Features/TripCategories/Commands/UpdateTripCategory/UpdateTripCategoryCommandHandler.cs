using MediatR;
using TripMate.Application.DTOs.TripCategories;
using TripMate.Domain.Entities;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.TripCategories.Commands.UpdateTripCategory;

public class UpdateTripCategoryCommandHandler : IRequestHandler<UpdateTripCategoryCommand, TripCategoryDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateTripCategoryCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<TripCategoryDto> Handle(UpdateTripCategoryCommand request, CancellationToken cancellationToken)
    {
        var repo = _unitOfWork.Repository<TripCategory>();

        var category = await repo.GetByIdAsync(request.Id);
        if (category == null)
            throw new NotFoundException($"Không tìm thấy loại chuyến đi với ID: {request.Id}");

        if (category.IsDeleted)
            throw new BusinessRuleException($"Loại chuyến đi '{category.Name}' đã bị xóa, không thể chỉnh sửa.");

        var name = request.Name.Trim();
        var slug = request.Slug.Trim().ToLower();

        // Kiểm tra trùng tên (ngoại trừ bản ghi hiện tại)
        var existingByName = await repo.FindAsync(c => c.Name.ToLower() == name.ToLower() && c.Id != request.Id);
        if (existingByName.Any())
            throw new ConflictException($"Loại chuyến đi '{name}' đã tồn tại trong hệ thống.");

        // Kiểm tra trùng slug (ngoại trừ bản ghi hiện tại)
        var existingBySlug = await repo.FindAsync(c => c.Slug == slug && c.Id != request.Id);
        if (existingBySlug.Any())
            throw new ConflictException($"Slug '{slug}' đã được sử dụng. Vui lòng chọn slug khác.");

        category.Name = name;
        category.Slug = slug;
        category.Icon = request.Icon?.Trim();
        category.Description = request.Description?.Trim();
        category.DisplayOrder = request.DisplayOrder;
        category.IsActive = request.IsActive;
        category.UpdatedAt = DateTime.UtcNow;

        repo.Update(category);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(category);
    }

    private static TripCategoryDto MapToDto(TripCategory c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Slug = c.Slug,
        Icon = c.Icon,
        Description = c.Description,
        DisplayOrder = c.DisplayOrder,
        IsActive = c.IsActive,
        IsDeleted = c.IsDeleted,
        CreatedAt = c.CreatedAt,
        UpdatedAt = c.UpdatedAt
    };
}
