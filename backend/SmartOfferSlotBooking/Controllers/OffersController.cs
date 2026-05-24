using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartOfferSlotBooking.Data;
using SmartOfferSlotBooking.DTOs;
using SmartOfferSlotBooking.Extensions;
using SmartOfferSlotBooking.Services;

namespace SmartOfferSlotBooking.Controllers;

[ApiController]
[Route("api/offers")]
public class OffersController : ControllerBase
{
    private readonly IOfferService _offerService;
    private readonly ISlotService _slotService;
    private readonly ApplicationDbContext _context;

    public OffersController(IOfferService offerService, ISlotService slotService, ApplicationDbContext context)
    {
        _offerService = offerService;
        _slotService = slotService;
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<OfferResponse>>> GetOffers(
        [FromQuery] string? businessType,
        [FromQuery] string? category,
        [FromQuery] DateTime? date,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] bool availableOnly = false,
        [FromQuery] bool admin = false)
    {
        if (admin && User.Identity?.IsAuthenticated == true)
        {
            var businessId = await GetBusinessIdForUserAsync(User.GetUserId());
            if (businessId == null) return Ok(new List<OfferResponse>());
            return Ok(await _offerService.GetAllOffersAsync(businessId, includeExpired: true));
        }

        return Ok(await _offerService.GetPublicOffersAsync(
            businessType, category, date, minPrice, maxPrice, availableOnly));
    }

    [HttpGet("{id:int}/slots")]
    public async Task<ActionResult<List<SlotResponse>>> GetOfferSlots(int id)
    {
        return Ok(await _slotService.GetSlotsByOfferAsync(id));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OfferResponse>> GetOffer(int id)
    {
        var offer = await _offerService.GetOfferByIdAsync(id, includeExpired: User.Identity?.IsAuthenticated == true);
        return offer == null ? NotFound() : Ok(offer);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<OfferResponse>> Create([FromBody] CreateOfferRequest request)
    {
        var businessId = await GetBusinessIdForUserAsync(User.GetUserId());
        if (businessId == null)
            return BadRequest(new { message = "Create a business profile first" });

        try
        {
            var offer = await _offerService.CreateOfferAsync(businessId.Value, request);
            return CreatedAtAction(nameof(GetOffer), new { id = offer.Id }, offer);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<ActionResult<OfferResponse>> Update(int id, [FromBody] UpdateOfferRequest request)
    {
        try
        {
            return Ok(await _offerService.UpdateOfferAsync(id, request));
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
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _offerService.DeleteOfferAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    private async Task<int?> GetBusinessIdForUserAsync(int userId)
    {
        var business = await _context.Businesses.FirstOrDefaultAsync(b => b.UserId == userId);
        return business?.Id;
    }
}
