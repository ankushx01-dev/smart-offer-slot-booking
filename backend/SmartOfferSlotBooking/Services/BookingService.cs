using Microsoft.EntityFrameworkCore;
using SmartOfferSlotBooking.Data;
using SmartOfferSlotBooking.DTOs;
using SmartOfferSlotBooking.Helpers;
using SmartOfferSlotBooking.Models;

namespace SmartOfferSlotBooking.Services;

public interface IBookingService
{
    Task<BookingResponse?> GetBookingByIdAsync(int bookingId);
    Task<BookingResponse?> GetBookingByReferenceAsync(string bookingReference);
    Task<List<BookingResponse>> GetAllBookingsAsync(int? businessId = null);
    Task<BookingResponse> CreateBookingAsync(CreateBookingRequest request);
    Task<BookingResponse> UpdateBookingStatusAsync(int bookingId, string newStatus);
}

public class BookingService : IBookingService
{
    private readonly ApplicationDbContext _context;
    private readonly ISlotService _slotService;

    public BookingService(ApplicationDbContext context, ISlotService slotService)
    {
        _context = context;
        _slotService = slotService;
    }

    public async Task<BookingResponse?> GetBookingByIdAsync(int bookingId)
    {
        var booking = await LoadBookingQuery().FirstOrDefaultAsync(b => b.Id == bookingId);
        return booking == null ? null : MapToBookingResponse(booking);
    }

    public async Task<BookingResponse?> GetBookingByReferenceAsync(string bookingReference)
    {
        var booking = await LoadBookingQuery()
            .FirstOrDefaultAsync(b => b.BookingReference == bookingReference);
        return booking == null ? null : MapToBookingResponse(booking);
    }

    public async Task<List<BookingResponse>> GetAllBookingsAsync(int? businessId = null)
    {
        var query = LoadBookingQuery();

        if (businessId.HasValue)
            query = query.Where(b => b.Offer != null && b.Offer.BusinessId == businessId);

        var bookings = await query.OrderByDescending(b => b.CreatedAt).ToListAsync();
        return bookings.Select(MapToBookingResponse).ToList();
    }

    public async Task<BookingResponse> CreateBookingAsync(CreateBookingRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CustomerName))
            throw new ArgumentException("Customer name is required");

        if (string.IsNullOrWhiteSpace(request.CustomerPhone) || request.CustomerPhone.Length < 10)
            throw new ArgumentException("Valid phone number is required");

        if (request.PeopleCount <= 0)
            throw new ArgumentException("People count must be greater than 0");

        if (request.SlotId <= 0)
            throw new ArgumentException("Please select a valid slot");

        var isAvailable = await _slotService.IsSlotAvailableAsync(request.SlotId, request.PeopleCount);
        if (!isAvailable)
            throw new InvalidOperationException("Slot is not available for booking");

        var slot = await _context.OfferSlots.FirstOrDefaultAsync(s => s.Id == request.SlotId);
        if (slot == null)
            throw new KeyNotFoundException("Slot not found");

        if (request.PeopleCount > slot.AvailableCount)
            throw new InvalidOperationException("Requested people count exceeds available capacity");

        var offer = await _context.Offers.Include(o => o.Business)
            .FirstOrDefaultAsync(o => o.Id == slot.OfferId);

        if (offer == null)
            throw new KeyNotFoundException("Offer not found");

        if (!OfferRules.IsBookable(offer))
            throw new InvalidOperationException("This offer is not available for booking");

        var existingBookings = await _context.Bookings
            .Where(b => b.CustomerPhone == request.CustomerPhone && b.OfferId == offer.Id && b.Status != "Cancelled")
            .CountAsync();

        if (existingBookings >= offer.MaxBookingPerCustomer)
            throw new InvalidOperationException(
                $"Customer has reached maximum booking limit ({offer.MaxBookingPerCustomer}) for this offer");

        var booking = new Booking
        {
            BookingReference = GenerateBookingReference(),
            OfferId = offer.Id,
            SlotId = request.SlotId,
            CustomerName = request.CustomerName,
            CustomerPhone = request.CustomerPhone,
            CustomerEmail = request.CustomerEmail,
            PeopleCount = request.PeopleCount,
            SpecialNote = request.SpecialNote,
            Status = "Pending"
        };

        _context.Bookings.Add(booking);

        slot.BookedCount += request.PeopleCount;
        if (slot.BookedCount >= slot.Capacity)
            slot.Status = "Full";
        slot.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        booking.Offer = offer;
        booking.Slot = slot;
        return MapToBookingResponse(booking);
    }

    public async Task<BookingResponse> UpdateBookingStatusAsync(int bookingId, string newStatus)
    {
        var validStatuses = new[] { "Pending", "Confirmed", "Cancelled", "Completed", "NoShow" };
        if (!validStatuses.Contains(newStatus))
            throw new ArgumentException($"Invalid status. Valid statuses: {string.Join(", ", validStatuses)}");

        var booking = await LoadBookingQuery().FirstOrDefaultAsync(b => b.Id == bookingId);
        if (booking == null)
            throw new KeyNotFoundException($"Booking {bookingId} not found");

        var previousStatus = booking.Status;
        booking.Status = newStatus;
        booking.UpdatedAt = DateTime.UtcNow;

        if (previousStatus != "Cancelled" && newStatus == "Cancelled")
        {
            var slot = await _context.OfferSlots.FirstOrDefaultAsync(s => s.Id == booking.SlotId);
            if (slot != null)
            {
                slot.BookedCount = Math.Max(0, slot.BookedCount - booking.PeopleCount);
                if (slot.BookedCount < slot.Capacity && slot.Status == "Full")
                    slot.Status = "Available";
                slot.UpdatedAt = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync();
        return MapToBookingResponse(booking);
    }

    private IQueryable<Booking> LoadBookingQuery() =>
        _context.Bookings
            .Include(b => b.Offer!)
                .ThenInclude(o => o.Business)
            .Include(b => b.Slot);

    private static string GenerateBookingReference()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();
        var randomPart = new string(Enumerable.Range(0, 6)
            .Select(_ => chars[random.Next(chars.Length)])
            .ToArray());

        return $"BK-{DateTime.UtcNow:yyyyMMdd}-{randomPart}";
    }

    private static BookingResponse MapToBookingResponse(Booking booking) => new()
    {
        Id = booking.Id,
        BookingReference = booking.BookingReference,
        OfferId = booking.OfferId,
        SlotId = booking.SlotId,
        CustomerName = booking.CustomerName,
        CustomerPhone = booking.CustomerPhone,
        CustomerEmail = booking.CustomerEmail,
        PeopleCount = booking.PeopleCount,
        SpecialNote = booking.SpecialNote,
        Status = booking.Status,
        OfferTitle = booking.Offer?.Title,
        BusinessName = booking.Offer?.Business?.Name,
        Offer = booking.Offer == null ? null : new OfferResponse
        {
            Id = booking.Offer.Id,
            BusinessId = booking.Offer.BusinessId,
            Title = booking.Offer.Title,
            Description = booking.Offer.Description,
            Category = booking.Offer.Category,
            OriginalPrice = booking.Offer.OriginalPrice,
            OfferPrice = booking.Offer.OfferPrice,
            DiscountPercentage = booking.Offer.DiscountPercentage,
            StartDate = booking.Offer.StartDate.ToString("yyyy-MM-dd"),
            EndDate = booking.Offer.EndDate.ToString("yyyy-MM-dd"),
            Status = booking.Offer.Status,
            MaxBookingPerCustomer = booking.Offer.MaxBookingPerCustomer
        },
        Slot = booking.Slot == null ? null : new SlotResponse
        {
            Id = booking.Slot.Id,
            OfferId = booking.Slot.OfferId,
            SlotDate = booking.Slot.SlotDate.ToString("yyyy-MM-dd"),
            StartTime = booking.Slot.StartTime.ToString("HH:mm"),
            EndTime = booking.Slot.EndTime.ToString("HH:mm"),
            Capacity = booking.Slot.Capacity,
            BookedCount = booking.Slot.BookedCount,
            AvailableCount = booking.Slot.AvailableCount,
            Status = booking.Slot.Status
        },
        CreatedAt = booking.CreatedAt,
        UpdatedAt = booking.UpdatedAt
    };
}
