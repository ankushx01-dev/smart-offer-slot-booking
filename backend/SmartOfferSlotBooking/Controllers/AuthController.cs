using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartOfferSlotBooking.Data;
using SmartOfferSlotBooking.DTOs;
using SmartOfferSlotBooking.Extensions;
using SmartOfferSlotBooking.Helpers;
using SmartOfferSlotBooking.Models;
using SmartOfferSlotBooking.Services;

namespace SmartOfferSlotBooking.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IAuthService _authService;
    private readonly IBusinessService _businessService;
    private readonly IOfferService _offerService;
    private readonly ISlotService _slotService;

    public AuthController(
        ApplicationDbContext context,
        IAuthService authService,
        IBusinessService businessService,
        IOfferService offerService,
        ISlotService slotService)
    {
        _context = context;
        _authService = authService;
        _businessService = businessService;
        _offerService = offerService;
        _slotService = slotService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<LoginResponse>> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Name, email, and password are required" });
        }

        if (request.Password.Length < 6)
            return BadRequest(new { message = "Password must be at least 6 characters" });

        var email = request.Email.Trim().ToLowerInvariant();
        if (await _context.Users.AnyAsync(u => u.Email.ToLower() == email))
            return BadRequest(new { message = "An account with this email already exists" });

        var user = new User
        {
            Name = request.Name.Trim(),
            Email = email,
            PasswordHash = _authService.HashPassword(request.Password),
            Role = "Admin"
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(await BuildLoginResponseAsync(user.Id));
    }

    [Authorize]
    [HttpPost("onboarding")]
    public async Task<ActionResult<LoginResponse>> CompleteOnboarding([FromBody] OnboardingRequest request)
    {
        var userId = User.GetUserId();
        var user = await _context.Users
            .Include(u => u.Business)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return Unauthorized(new { message = "Session expired. Please sign in again." });

        if (user.Business != null)
            return BadRequest(new { message = "Your business is already set up. Go to the dashboard." });

        try
        {
            var (businessReq, offerReq, slotReq) = OnboardingMapper.Map(request, userId, user.Email);
            var business = await _businessService.CreateAsync(userId, businessReq);
            var offer = await _offerService.CreateOfferAsync(business.Id, offerReq);

            slotReq.OfferId = offer.Id;
            await _slotService.CreateSlotAsync(slotReq);

            return Ok(await BuildLoginResponseAsync(userId));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Setup failed: {ex.Message}" });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Email and password are required" });

        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _context.Users
            .Include(u => u.Business)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email);

        if (user == null || !_authService.VerifyPassword(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password" });

        return Ok(await BuildLoginResponseAsync(user.Id));
    }

    private async Task<LoginResponse> BuildLoginResponseAsync(int userId)
    {
        var user = await _context.Users
            .Include(u => u.Business)
            .FirstAsync(u => u.Id == userId);

        var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET")
            ?? "your_super_secret_jwt_key_change_this_in_production_at_least_32_chars";
        var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "SmartOfferSlotBooking";
        var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "SmartOfferSlotBookingUsers";

        var token = _authService.GenerateJwtToken(user, jwtSecret, jwtIssuer, jwtAudience);

        return new LoginResponse
        {
            UserId = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            BusinessType = user.Business?.BusinessType,
            BusinessName = user.Business?.Name,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddHours(1)
        };
    }
}
