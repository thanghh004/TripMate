namespace TripMate.Application.DTOs.Countries;

/// <summary>
/// DTO yêu cầu tạo mới Quốc gia
/// </summary>
public class CreateCountryDto
{
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string? FlagIcon { get; set; }
    public int DisplayOrder { get; set; } = 0;
}
