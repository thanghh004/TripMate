namespace TripMate.Application.DTOs.Countries;

/// <summary>
/// DTO yêu cầu cập nhật Quốc gia
/// </summary>
public class UpdateCountryDto
{
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string? FlagIcon { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
}
