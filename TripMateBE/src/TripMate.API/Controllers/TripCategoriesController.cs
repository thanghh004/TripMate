using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TripMate.Application.DTOs.TripCategories;
using TripMate.Application.Features.TripCategories.Commands.CreateTripCategory;
using TripMate.Application.Features.TripCategories.Commands.DeleteTripCategory;
using TripMate.Application.Features.TripCategories.Commands.UpdateTripCategory;
using TripMate.Application.Features.TripCategories.Queries.GetTripCategories;

namespace TripMate.API.Controllers;

[Route("api/categories")]
public class TripCategoriesController : BaseApiController
{
    /// <summary>
    /// Lấy danh sách Loại chuyến đi
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetCategories([FromQuery] bool? isActive)
    {
        var result = await Mediator.Send(new GetTripCategoriesQuery(isActive));
        return Ok(result);
    }

    /// <summary>
    /// Tạo mới Loại chuyến đi (Dành cho Admin)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,0")]
    public async Task<IActionResult> CreateCategory([FromBody] CreateTripCategoryDto dto)
    {
        var command = new CreateTripCategoryCommand(dto.Name, dto.Slug, dto.Icon, dto.Description, dto.DisplayOrder);
        var result = await Mediator.Send(command);
        return CreatedAtAction(nameof(GetCategories), new { id = result.Id }, result);
    }

    /// <summary>
    /// Cập nhật Loại chuyến đi (Dành cho Admin)
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,0")]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] UpdateTripCategoryDto dto)
    {
        var command = new UpdateTripCategoryCommand(id, dto.Name, dto.Slug, dto.Icon, dto.Description, dto.DisplayOrder, dto.IsActive);
        var result = await Mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Xóa mềm Loại chuyến đi (Dành cho Admin)
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,0")]
    public async Task<IActionResult> DeleteCategory(Guid id)
    {
        await Mediator.Send(new DeleteTripCategoryCommand(id));
        return NoContent();
    }
}
