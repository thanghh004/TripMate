using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TripMate.Application.DTOs.Countries;
using TripMate.Application.Features.Countries.Commands.CreateCountry;
using TripMate.Application.Features.Countries.Commands.DeleteCountry;
using TripMate.Application.Features.Countries.Commands.UpdateCountry;
using TripMate.Application.Features.Countries.Queries.GetAllCountries;
using TripMate.Application.Features.Countries.Queries.GetCountryById;

namespace TripMate.API.Controllers;

/// <summary>
/// Quản lý danh mục Quốc gia (Countries)
/// </summary>
public class CountriesController : BaseApiController
{
    /// <summary>
    /// Lấy danh sách tất cả các quốc gia (Lọc theo IsActive)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<CountryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllCountries([FromQuery] bool? isActive = null, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new GetAllCountriesQuery(isActive), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Lấy thông tin chi tiết một quốc gia theo ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(CountryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCountryById(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new GetCountryByIdQuery(id), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Tạo mới một quốc gia (Admin)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,0")]
    [ProducesResponseType(typeof(CountryDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateCountry([FromBody] CreateCountryDto request, CancellationToken cancellationToken = default)
    {
        var command = new CreateCountryCommand(request.Name, request.Code, request.FlagIcon, request.DisplayOrder);
        var result = await Mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetCountryById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Cập nhật thông tin quốc gia (Admin)
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,0")]
    [ProducesResponseType(typeof(CountryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCountry(Guid id, [FromBody] UpdateCountryDto request, CancellationToken cancellationToken = default)
    {
        var command = new UpdateCountryCommand(id, request.Name, request.Code, request.FlagIcon, request.DisplayOrder, request.IsActive);
        var result = await Mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Xóa mềm một quốc gia (Admin)
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,0")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCountry(Guid id, CancellationToken cancellationToken = default)
    {
        await Mediator.Send(new DeleteCountryCommand(id), cancellationToken);
        return NoContent();
    }
}
