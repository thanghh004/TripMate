namespace TripMate.Application.DTOs.Cities;

/// <summary>
/// DTO yêu cầu cập nhật Thành phố / Tỉnh
/// </summary>
public class UpdateCityDto
{
    public Guid CountryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
}
