namespace TripMate.Application.DTOs.TripCategories;

/// <summary>
/// DTO tạo mới Loại chuyến đi
/// </summary>
public class CreateTripCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? Description { get; set; }
    public int DisplayOrder { get; set; }
}
