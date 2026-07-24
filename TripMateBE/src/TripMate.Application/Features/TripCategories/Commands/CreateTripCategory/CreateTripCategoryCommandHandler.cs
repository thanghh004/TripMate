using MediatR;
using TripMate.Application.DTOs.TripCategories;
using TripMate.Domain.Entities;
using TripMate.Domain.Exceptions;
using TripMate.Domain.Interfaces;

namespace TripMate.Application.Features.TripCategories.Commands.CreateTripCategory;

public class CreateTripCategoryCommandHandler : IRequestHandler<CreateTripCategoryCommand, TripCategoryDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateTripCategoryCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<TripCategoryDto> Handle(CreateTripCategoryCommand request, CancellationToken cancellationToken)
    {
        var repo = _unitOfWork.Repository<TripCategory>();
        var name = request.Name.Trim();
        var slug = request.Slug.Trim().ToLower();

        // Kiểm tra trùng tên
        var existingByName = await repo.FindAsync(c => c.Name.ToLower() == name.ToLower());
        if (existingByName.Any())
            throw new ConflictException($"Loại chuyến đi '{name}' đã tồn tại trong hệ thống.");

        // Kiểm tra trùng slug
        var existingBySlug = await repo.FindAsync(c => c.Slug == slug);
        if (existingBySlug.Any())
            throw new ConflictException($"Slug '{slug}' đã được sử dụng. Vui lòng chọn slug khác.");

        var category = new TripCategory
        {
            Name = name,
            Slug = slug,
            Icon = request.Icon?.Trim(),
            Description = request.Description?.Trim(),
            DisplayOrder = request.DisplayOrder,
            IsActive = true
        };

        await repo.AddAsync(category);
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
