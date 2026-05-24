using Microsoft.EntityFrameworkCore;
using SmartOfferSlotBooking.Data;
using SmartOfferSlotBooking.DTOs;

namespace SmartOfferSlotBooking.Services;

public interface IDashboardService
{
    Task<DashboardSummaryResponse> GetSummaryAsync(int businessId);
}

public class DashboardService : IDashboardService
{
    private readonly ApplicationDbContext _context;
    private readonly IBookingService _bookingService;

    public DashboardService(ApplicationDbContext context, IBookingService bookingService)
    {
        _context = context;
        _bookingService = bookingService;
    }

    public async Task<DashboardSummaryResponse> GetSummaryAsync(int businessId)
    {
        var offers = await _context.Offers.Where(o => o.BusinessId == businessId).ToListAsync();
        var offerIds = offers.Select(o => o.Id).ToList();

        var slots = await _context.OfferSlots
            .Where(s => offerIds.Contains(s.OfferId))
            .ToListAsync();

        var bookings = await _context.Bookings
            .Where(b => offerIds.Contains(b.OfferId))
            .ToListAsync();

        var today = DateTime.UtcNow.Date;
        var totalCapacity = slots.Sum(s => s.Capacity);
        var bookedSeats = slots.Sum(s => s.BookedCount);
        var availableSeats = totalCapacity - bookedSeats;
        var conversionRate = totalCapacity > 0
            ? Math.Round((decimal)bookedSeats / totalCapacity * 100, 2)
            : 0;

        var recent = await _bookingService.GetAllBookingsAsync(businessId);

        return new DashboardSummaryResponse
        {
            TotalOffers = offers.Count,
            ActiveOffers = offers.Count(o =>
                o.Status == "Active"
                && o.StartDate.Date <= today
                && o.EndDate.Date >= today),
            TotalBookings = bookings.Count,
            TodaysBookings = bookings.Count(b => b.CreatedAt.Date == today),
            TotalCapacity = totalCapacity,
            BookedSeats = bookedSeats,
            AvailableSeats = availableSeats,
            ConversionRate = conversionRate,
            RecentBookings = recent.Take(10).ToList()
        };
    }
}
