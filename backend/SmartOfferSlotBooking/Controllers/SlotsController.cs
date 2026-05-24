using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartOfferSlotBooking.DTOs;
using SmartOfferSlotBooking.Services;

namespace SmartOfferSlotBooking.Controllers;

[ApiController]
[Route("api/slots")]
public class SlotsController : ControllerBase
{
    private readonly ISlotService _slotService;

    public SlotsController(ISlotService slotService)
    {
        _slotService = slotService;
    }

    [HttpGet]
    public async Task<ActionResult<List<SlotResponse>>> GetAll([FromQuery] int? offerId)
    {
        if (offerId.HasValue)
            return Ok(await _slotService.GetSlotsByOfferAsync(offerId.Value));

        return Ok(await _slotService.GetAllSlotsAsync());
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<SlotResponse>> Create([FromBody] CreateSlotRequest request)
    {
        try
        {
            var slot = await _slotService.CreateSlotAsync(request);
            return CreatedAtAction(nameof(GetAll), new { offerId = slot.OfferId }, slot);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<ActionResult<SlotResponse>> Update(int id, [FromBody] UpdateSlotRequest request)
    {
        try
        {
            return Ok(await _slotService.UpdateSlotAsync(id, request));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _slotService.DeleteSlotAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
