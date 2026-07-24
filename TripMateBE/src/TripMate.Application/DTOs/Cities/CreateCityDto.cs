namespace TripMate.Application.DTOs.Cities;

/// <summary>
/// DTO yêu cầu tạo mới Thành phố / Tỉnh
/// </summary>
public class CreateCityDto
{
    public Guid CountryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public int DisplayOrder { get; set; } = 0;
}
