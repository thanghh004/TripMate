using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TripMate.Application.DTOs.Cities;
using TripMate.Application.Features.Cities.Commands.CreateCity;
using TripMate.Application.Features.Cities.Commands.DeleteCity;
using TripMate.Application.Features.Cities.Commands.UpdateCity;
using TripMate.Application.Features.Cities.Queries.GetCities;
using TripMate.Application.Features.Cities.Queries.GetCityById;

namespace TripMate.API.Controllers;

/// <summary>
/// Quản lý danh mục Thành phố / Tỉnh (Cities)
/// </summary>
public class CitiesController : BaseApiController
{
    /// <summary>
    /// Lấy danh sách thành phố / tỉnh (Lọc theo CountryId & IsActive)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<CityDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllCities([FromQuery] Guid? countryId = null, [FromQuery] bool? isActive = null, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new GetCitiesQuery(countryId, isActive), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Lấy thông tin chi tiết một thành phố / tỉnh theo ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(CityDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCityById(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new GetCityByIdQuery(id), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Tạo mới một thành phố / tỉnh (Admin)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,0")]
    [ProducesResponseType(typeof(CityDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateCity([FromBody] CreateCityDto request, CancellationToken cancellationToken = default)
    {
        var command = new CreateCityCommand(request.CountryId, request.Name, request.Slug, request.DisplayOrder);
        var result = await Mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetCityById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Cập nhật thông tin thành phố / tỉnh (Admin)
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,0")]
    [ProducesResponseType(typeof(CityDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCity(Guid id, [FromBody] UpdateCityDto request, CancellationToken cancellationToken = default)
    {
        var command = new UpdateCityCommand(id, request.CountryId, request.Name, request.Slug, request.DisplayOrder, request.IsActive);
        var result = await Mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Xóa mềm một thành phố / tỉnh (Admin)
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,0")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCity(Guid id, CancellationToken cancellationToken = default)
    {
        await Mediator.Send(new DeleteCityCommand(id), cancellationToken);
        return NoContent();
    }
}
