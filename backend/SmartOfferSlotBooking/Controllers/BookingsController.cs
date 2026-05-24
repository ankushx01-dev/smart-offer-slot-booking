using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartOfferSlotBooking.Data;
using SmartOfferSlotBooking.DTOs;
using SmartOfferSlotBooking.Extensions;
using SmartOfferSlotBooking.Services;

namespace SmartOfferSlotBooking.Controllers;

[ApiController]
[Route("api/bookings")]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;
    private readonly ApplicationDbContext _context;

    public BookingsController(IBookingService bookingService, ApplicationDbContext context)
    {
        _bookingService = bookingService;
        _context = context;
    }

    [HttpPost]
    public async Task<ActionResult<BookingResponse>> Create([FromBody] CreateBookingRequest request)
    {
        try
        {
            var booking = await _bookingService.CreateBookingAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = booking.Id }, booking);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<List<BookingResponse>>> GetAll()
    {
        var businessId = await GetBusinessIdForUserAsync(User.GetUserId());
        if (businessId == null) return Ok(new List<BookingResponse>());
        return Ok(await _bookingService.GetAllBookingsAsync(businessId));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BookingResponse>> GetById(int id)
    {
        var booking = await _bookingService.GetBookingByIdAsync(id);
        return booking == null ? NotFound() : Ok(booking);
    }

    [HttpGet("reference/{reference}")]
    public async Task<ActionResult<BookingResponse>> GetByReference(string reference)
    {
        var booking = await _bookingService.GetBookingByReferenceAsync(reference);
        return booking == null ? NotFound() : Ok(booking);
    }

    [Authorize]
    [HttpPut("{id}/status")]
    public async Task<ActionResult<BookingResponse>> UpdateStatus(int id, [FromBody] UpdateBookingStatusRequest request)
    {
        try
        {
            return Ok(await _bookingService.UpdateBookingStatusAsync(id, request.Status));
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

    private async Task<int?> GetBusinessIdForUserAsync(int userId)
    {
        var business = await _context.Businesses.FirstOrDefaultAsync(b => b.UserId == userId);
        return business?.Id;
    }
}
