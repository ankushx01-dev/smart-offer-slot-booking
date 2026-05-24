using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartOfferSlotBooking.Data;
using SmartOfferSlotBooking.DTOs;
using SmartOfferSlotBooking.Extensions;
using SmartOfferSlotBooking.Services;

namespace SmartOfferSlotBooking.Controllers;

[ApiController]
[Authorize]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly ApplicationDbContext _context;

    public DashboardController(IDashboardService dashboardService, ApplicationDbContext context)
    {
        _dashboardService = dashboardService;
        _context = context;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryResponse>> GetSummary()
    {
        var business = await _context.Businesses.FirstOrDefaultAsync(b => b.UserId == User.GetUserId());
        if (business == null)
        {
            return Ok(new DashboardSummaryResponse());
        }

        return Ok(await _dashboardService.GetSummaryAsync(business.Id));
    }
}
