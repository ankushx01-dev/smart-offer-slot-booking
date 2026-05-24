using Microsoft.EntityFrameworkCore;
using SmartOfferSlotBooking.Constants;
using SmartOfferSlotBooking.Data;
using SmartOfferSlotBooking.DTOs;
using SmartOfferSlotBooking.Helpers;
using SmartOfferSlotBooking.Models;

namespace SmartOfferSlotBooking.Services;

public interface IOfferService
{
    Task<OfferResponse?> GetOfferByIdAsync(int offerId, bool includeExpired = false);
    Task<List<OfferResponse>> GetAllOffersAsync(int? businessId = null, bool includeExpired = false);
    Task<List<OfferResponse>> GetPublicOffersAsync(
        string? businessType = null,
        string? category = null,
        DateTime? filterDate = null,
        decimal? minPrice = null,
        decimal? maxPrice = null,
        bool availableOnly = false);
    Task<OfferResponse> CreateOfferAsync(int businessId, CreateOfferRequest request);
    Task<OfferResponse> UpdateOfferAsync(int offerId, UpdateOfferRequest request);
    Task DeleteOfferAsync(int offerId);
}

public class OfferService : IOfferService
{
    private readonly ApplicationDbContext _context;

    public OfferService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<OfferResponse?> GetOfferByIdAsync(int offerId, bool includeExpired = false)
    {
        var offer = await _context.Offers
            .Include(o => o.Business)
            .Include(o => o.Slots)
            .FirstOrDefaultAsync(o => o.Id == offerId);

        if (offer == null) return null;

        RefreshStatus(offer, includeExpired);

        if (!includeExpired && !OfferRules.IsPubliclyVisible(offer))
            return null;

        return MapToOfferResponse(offer);
    }

    public async Task<List<OfferResponse>> GetAllOffersAsync(int? businessId = null, bool includeExpired = false)
    {
        var query = _context.Offers.Include(o => o.Business).Include(o => o.Slots).AsQueryable();

        if (businessId.HasValue)
            query = query.Where(o => o.BusinessId == businessId);

        var offers = await query.OrderByDescending(o => o.CreatedAt).ToListAsync();

        foreach (var offer in offers)
            RefreshStatus(offer, includeExpired);

        var results = new List<OfferResponse>();
        foreach (var offer in offers)
            results.Add(MapToOfferResponse(offer));

        return results;
    }

    public async Task<List<OfferResponse>> GetPublicOffersAsync(
        string? businessType = null,
        string? category = null,
        DateTime? filterDate = null,
        decimal? minPrice = null,
        decimal? maxPrice = null,
        bool availableOnly = false)
    {
        var query = _context.Offers
            .Include(o => o.Business)
            .Include(o => o.Slots)
            .Where(o =>
                o.Status == "Active"
                && o.StartDate <= DateTime.UtcNow.Date
                && o.EndDate >= DateTime.UtcNow.Date)
            .AsQueryable();

        if (!string.IsNullOrEmpty(businessType))
        {
            if (!BusinessTypes.IsValid(businessType))
                return new List<OfferResponse>();

            var normalizedType = BusinessTypes.Normalize(businessType);
            query = query.Where(o => o.Business != null && o.Business.BusinessType == normalizedType);
        }

        if (!string.IsNullOrEmpty(category))
            query = query.Where(o => o.Category == category);

        if (minPrice.HasValue)
            query = query.Where(o => o.OfferPrice >= minPrice);

        if (maxPrice.HasValue)
            query = query.Where(o => o.OfferPrice <= maxPrice);

        if (filterDate.HasValue)
        {
            var date = filterDate.Value.Date;
            query = query.Where(o => o.Slots.Any(s => s.SlotDate.Date == date));
        }

        var offers = await query.OrderBy(o => o.EndDate).ToListAsync();

        if (availableOnly)
        {
            offers = offers.Where(o =>
                o.Slots.Any(s => s.Status == "Available" && s.BookedCount < s.Capacity)).ToList();
        }

        var results = new List<OfferResponse>();
        foreach (var offer in offers)
            results.Add(MapToOfferResponse(offer));

        return results;
    }

    public async Task<OfferResponse> CreateOfferAsync(int businessId, CreateOfferRequest request)
    {
        if (request.OfferPrice >= request.OriginalPrice)
            throw new ArgumentException("Offer price must be less than original price");

        var discountPercentage = ((request.OriginalPrice - request.OfferPrice) / request.OriginalPrice) * 100;

        var offer = new Offer
        {
            BusinessId = businessId,
            Title = request.Title,
            Description = request.Description,
            Category = request.Category,
            OriginalPrice = request.OriginalPrice,
            OfferPrice = request.OfferPrice,
            DiscountPercentage = discountPercentage,
            StartDate = DateTimeHelper.ToUtcDate(request.StartDate),
            EndDate = DateTimeHelper.ToUtcDate(request.EndDate),
            TermsAndConditions = request.TermsAndConditions,
            Status = request.Status,
            MaxBookingPerCustomer = request.MaxBookingPerCustomer
        };

        _context.Offers.Add(offer);
        await _context.SaveChangesAsync();

        offer = await _context.Offers.Include(o => o.Business).Include(o => o.Slots)
            .FirstAsync(o => o.Id == offer.Id);

        return MapToOfferResponse(offer);
    }

    public async Task<OfferResponse> UpdateOfferAsync(int offerId, UpdateOfferRequest request)
    {
        var offer = await _context.Offers.Include(o => o.Business).Include(o => o.Slots)
            .FirstOrDefaultAsync(o => o.Id == offerId);

        if (offer == null)
            throw new KeyNotFoundException($"Offer {offerId} not found");

        if (request.OriginalPrice.HasValue || request.OfferPrice.HasValue)
        {
            var origPrice = request.OriginalPrice ?? offer.OriginalPrice;
            var offerPrice = request.OfferPrice ?? offer.OfferPrice;

            if (offerPrice >= origPrice)
                throw new ArgumentException("Offer price must be less than original price");

            offer.DiscountPercentage = ((origPrice - offerPrice) / origPrice) * 100;
        }

        if (request.Title != null) offer.Title = request.Title;
        if (request.Description != null) offer.Description = request.Description;
        if (request.Category != null) offer.Category = request.Category;
        if (request.OriginalPrice.HasValue) offer.OriginalPrice = request.OriginalPrice.Value;
        if (request.OfferPrice.HasValue) offer.OfferPrice = request.OfferPrice.Value;
        if (request.StartDate.HasValue) offer.StartDate = DateTimeHelper.ToUtcDate(request.StartDate.Value);
        if (request.EndDate.HasValue) offer.EndDate = DateTimeHelper.ToUtcDate(request.EndDate.Value);
        if (request.TermsAndConditions != null) offer.TermsAndConditions = request.TermsAndConditions;
        if (request.Status != null) offer.Status = request.Status;
        if (request.MaxBookingPerCustomer.HasValue) offer.MaxBookingPerCustomer = request.MaxBookingPerCustomer.Value;

        offer.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return MapToOfferResponse(offer);
    }

    public async Task DeleteOfferAsync(int offerId)
    {
        var offer = await _context.Offers.FirstOrDefaultAsync(o => o.Id == offerId);
        if (offer == null)
            throw new KeyNotFoundException($"Offer {offerId} not found");

        _context.Offers.Remove(offer);
        await _context.SaveChangesAsync();
    }

    private static void RefreshStatus(Offer offer, bool includeExpired)
    {
        if (!includeExpired && offer.EndDate.Date < DateTime.UtcNow.Date && offer.Status != "Cancelled")
            offer.Status = "Expired";
    }

    private static OfferResponse MapToOfferResponse(Offer offer)
    {
        var availableSlots = offer.Slots.Count(s =>
            s.Status == "Available"
            && s.BookedCount < s.Capacity
            && s.SlotDate.Date >= DateTime.UtcNow.Date);

        return new OfferResponse
        {
            Id = offer.Id,
            BusinessId = offer.BusinessId,
            Title = offer.Title,
            Description = offer.Description,
            Category = offer.Category,
            OriginalPrice = offer.OriginalPrice,
            OfferPrice = offer.OfferPrice,
            DiscountPercentage = offer.DiscountPercentage,
            StartDate = offer.StartDate.ToString("yyyy-MM-dd"),
            EndDate = offer.EndDate.ToString("yyyy-MM-dd"),
            TermsAndConditions = offer.TermsAndConditions,
            Status = offer.Status,
            MaxBookingPerCustomer = offer.MaxBookingPerCustomer,
            AvailableSlotsCount = availableSlots,
            Business = offer.Business == null ? null : new BusinessResponse
            {
                Id = offer.Business.Id,
                Name = offer.Business.Name,
                BusinessType = offer.Business.BusinessType,
                OwnerName = offer.Business.OwnerName,
                Phone = offer.Business.Phone,
                Email = offer.Business.Email,
                Address = offer.Business.Address,
                City = offer.Business.City,
                LogoUrl = offer.Business.LogoUrl,
                OpeningTime = offer.Business.OpeningTime.ToString("HH:mm"),
                ClosingTime = offer.Business.ClosingTime.ToString("HH:mm"),
                CreatedAt = offer.Business.CreatedAt,
                UpdatedAt = offer.Business.UpdatedAt
            },
            CreatedAt = offer.CreatedAt,
            UpdatedAt = offer.UpdatedAt
        };
    }
}
