using Microsoft.EntityFrameworkCore;
using SmartOfferSlotBooking.Data;
using SmartOfferSlotBooking.DTOs;
using SmartOfferSlotBooking.Helpers;
using SmartOfferSlotBooking.Models;

namespace SmartOfferSlotBooking.Services;

public interface ISlotService
{
    Task<SlotResponse?> GetSlotByIdAsync(int slotId);
    Task<List<SlotResponse>> GetSlotsByOfferAsync(int offerId);
    Task<List<SlotResponse>> GetAllSlotsAsync(int? businessId = null);
    Task<SlotResponse> CreateSlotAsync(CreateSlotRequest request);
    Task<SlotResponse> UpdateSlotAsync(int slotId, UpdateSlotRequest request);
    Task DeleteSlotAsync(int slotId);
    Task<bool> IsSlotAvailableAsync(int slotId, int peopleCount);
}

public class SlotService : ISlotService
{
    private readonly ApplicationDbContext _context;

    public SlotService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<SlotResponse?> GetSlotByIdAsync(int slotId)
    {
        var slot = await _context.OfferSlots.FirstOrDefaultAsync(s => s.Id == slotId);
        return slot == null ? null : MapToSlotResponse(slot);
    }

    public async Task<List<SlotResponse>> GetSlotsByOfferAsync(int offerId)
    {
        var slots = await _context.OfferSlots
            .Where(s => s.OfferId == offerId)
            .OrderBy(s => s.SlotDate)
            .ThenBy(s => s.StartTime)
            .ToListAsync();

        return slots.Select(MapToSlotResponse).ToList();
    }

    public async Task<List<SlotResponse>> GetAllSlotsAsync(int? businessId = null)
    {
        IQueryable<OfferSlot> query = _context.OfferSlots;

        if (businessId.HasValue)
        {
            query = query
                .Include(s => s.Offer)
                .Where(s => s.Offer != null && s.Offer.BusinessId == businessId);
        }

        var slots = await query
            .OrderByDescending(s => s.SlotDate)
            .ToListAsync();

        return slots.Select(MapToSlotResponse).ToList();
    }

    public async Task<SlotResponse> CreateSlotAsync(CreateSlotRequest request)
    {
        var offer = await _context.Offers.FirstOrDefaultAsync(o => o.Id == request.OfferId);
        if (offer == null)
            throw new KeyNotFoundException($"Offer {request.OfferId} not found");

        var slotDate = DateTimeHelper.ToUtcDate(request.SlotDate);
        if (slotDate < DateTime.UtcNow.Date)
            throw new ArgumentException("Slot date cannot be in the past");

        if (request.EndTime <= request.StartTime)
            throw new ArgumentException("End time must be after start time");

        if (request.Capacity <= 0)
            throw new ArgumentException("Capacity must be greater than 0");

        var slot = new OfferSlot
        {
            OfferId = request.OfferId,
            SlotDate = slotDate,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Capacity = request.Capacity,
            Status = "Available"
        };

        _context.OfferSlots.Add(slot);
        await _context.SaveChangesAsync();

        return MapToSlotResponse(slot);
    }

    public async Task<SlotResponse> UpdateSlotAsync(int slotId, UpdateSlotRequest request)
    {
        var slot = await _context.OfferSlots.FirstOrDefaultAsync(s => s.Id == slotId);
        if (slot == null)
            throw new KeyNotFoundException($"Slot {slotId} not found");

        if (request.SlotDate.HasValue)
        {
            var updatedDate = DateTimeHelper.ToUtcDate(request.SlotDate.Value);
            if (updatedDate < DateTime.UtcNow.Date)
                throw new ArgumentException("Slot date cannot be in the past");
            slot.SlotDate = updatedDate;
        }

        if (request.EndTime.HasValue && request.StartTime.HasValue && request.EndTime <= request.StartTime)
            throw new ArgumentException("End time must be after start time");

        if (request.Capacity.HasValue && request.Capacity <= 0)
            throw new ArgumentException("Capacity must be greater than 0");

        // Cannot reduce capacity below booked count
        if (request.Capacity.HasValue && request.Capacity < slot.BookedCount)
            throw new ArgumentException($"Capacity cannot be reduced below booked count ({slot.BookedCount})");

        if (request.StartTime.HasValue) slot.StartTime = request.StartTime.Value;
        if (request.EndTime.HasValue) slot.EndTime = request.EndTime.Value;
        if (request.Capacity.HasValue) slot.Capacity = request.Capacity.Value;
        if (request.Status != null) slot.Status = request.Status;

        slot.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return MapToSlotResponse(slot);
    }

    public async Task DeleteSlotAsync(int slotId)
    {
        var slot = await _context.OfferSlots.FirstOrDefaultAsync(s => s.Id == slotId);
        if (slot == null)
            throw new KeyNotFoundException($"Slot {slotId} not found");

        if (slot.BookedCount > 0)
            throw new InvalidOperationException("Cannot delete a slot with existing bookings");

        _context.OfferSlots.Remove(slot);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> IsSlotAvailableAsync(int slotId, int peopleCount)
    {
        var slot = await _context.OfferSlots.FirstOrDefaultAsync(s => s.Id == slotId);
        if (slot == null) return false;

        if (slot.Status != "Available") return false;
        if (slot.SlotDate.Date < DateTime.UtcNow.Date) return false;
        if (slot.AvailableCount < peopleCount) return false;

        var offer = await _context.Offers.FirstOrDefaultAsync(o => o.Id == slot.OfferId);
        if (offer == null) return false;
        if (!OfferRules.IsBookable(offer)) return false;

        return true;
    }

    private SlotResponse MapToSlotResponse(OfferSlot slot)
    {
        return new SlotResponse
        {
            Id = slot.Id,
            OfferId = slot.OfferId,
            SlotDate = slot.SlotDate.ToString("yyyy-MM-dd"),
            StartTime = slot.StartTime.ToString("HH:mm"),
            EndTime = slot.EndTime.ToString("HH:mm"),
            Capacity = slot.Capacity,
            BookedCount = slot.BookedCount,
            AvailableCount = slot.AvailableCount,
            Status = slot.Status,
            CreatedAt = slot.CreatedAt
        };
    }
}
