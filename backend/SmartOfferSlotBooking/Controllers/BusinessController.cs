using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartOfferSlotBooking.DTOs;
using SmartOfferSlotBooking.Extensions;
using SmartOfferSlotBooking.Services;

namespace SmartOfferSlotBooking.Controllers;

[ApiController]
[Route("api/business")]
public class BusinessController : ControllerBase
{
    private readonly IBusinessService _businessService;

    public BusinessController(IBusinessService businessService)
    {
        _businessService = businessService;
    }

    [Authorize]
    [HttpGet("mine")]
    public async Task<ActionResult<BusinessResponse>> GetMine()
    {
        var mine = await _businessService.GetByUserIdAsync(User.GetUserId());
        return mine == null ? NotFound(new { message = "Business profile not found" }) : Ok(mine);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<BusinessResponse>> Create([FromBody] CreateBusinessRequest request)
    {
        try
        {
            var result = await _businessService.CreateAsync(User.GetUserId(), request);
            return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpPut("mine")]
    public async Task<ActionResult<BusinessResponse>> UpsertMine([FromBody] CreateBusinessRequest request)
    {
        try
        {
            return Ok(await _businessService.UpsertForUserAsync(User.GetUserId(), request));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<ActionResult<BusinessResponse>> Get()
    {
        if (User.Identity?.IsAuthenticated == true)
        {
            var mine = await _businessService.GetByUserIdAsync(User.GetUserId());
            if (mine != null) return Ok(mine);
        }

        var first = await _businessService.GetByIdAsync(1);
        return first == null ? NotFound() : Ok(first);
    }

    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<BusinessResponse>> Update(int id, [FromBody] UpdateBusinessRequest request)
    {
        try
        {
            var result = await _businessService.UpdateAsync(id, User.GetUserId(), request);
            return Ok(result);
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
}
