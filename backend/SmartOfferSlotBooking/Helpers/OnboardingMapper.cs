using SmartOfferSlotBooking.DTOs;

namespace SmartOfferSlotBooking.Helpers;

public static class OnboardingMapper
{
    public static (CreateBusinessRequest Business, CreateOfferRequest Offer, CreateSlotRequest Slot) Map(
        OnboardingRequest request,
        int userId,
        string userEmail)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ArgumentException("Business name is required");
        if (string.IsNullOrWhiteSpace(request.BusinessType))
            throw new ArgumentException("Business type is required");
        if (string.IsNullOrWhiteSpace(request.OfferTitle))
            throw new ArgumentException("Offer title is required");

        var openingTime = ParseTime(request.OpeningTime, "Opening time");
        var closingTime = ParseTime(request.ClosingTime, "Closing time");
        if (closingTime <= openingTime)
            throw new ArgumentException("Closing time must be after opening time");

        var startDate = ParseDate(request.StartDate, "Start date");
        var endDate = ParseDate(request.EndDate, "End date");
        if (endDate < startDate)
            throw new ArgumentException("End date must be on or after start date");

        var slotDate = ParseDate(request.SlotDate, "Slot date");
        var slotStart = ParseTime(request.SlotStartTime, "Slot start time");
        var slotEnd = ParseTime(request.SlotEndTime, "Slot end time");
        if (slotEnd <= slotStart)
            throw new ArgumentException("Slot end time must be after start time");

        if (request.OriginalPrice <= 0 || request.OfferPrice <= 0)
            throw new ArgumentException("Prices must be greater than zero");
        if (request.OfferPrice >= request.OriginalPrice)
            throw new ArgumentException("Offer price must be less than original price");
        if (request.Capacity <= 0)
            throw new ArgumentException("Slot capacity must be at least 1");

        var business = new CreateBusinessRequest
        {
            Name = request.Name.Trim(),
            BusinessType = request.BusinessType.Trim(),
            OwnerName = request.OwnerName.Trim(),
            Phone = request.Phone.Trim(),
            Email = string.IsNullOrWhiteSpace(request.Email) ? userEmail : request.Email.Trim(),
            Address = request.Address.Trim(),
            City = request.City.Trim(),
            OpeningTime = openingTime,
            ClosingTime = closingTime
        };

        var offer = new CreateOfferRequest
        {
            Title = request.OfferTitle.Trim(),
            Description = string.IsNullOrWhiteSpace(request.OfferDescription)
                ? request.OfferTitle.Trim()
                : request.OfferDescription.Trim(),
            Category = request.Category.Trim(),
            OriginalPrice = request.OriginalPrice,
            OfferPrice = request.OfferPrice,
            StartDate = startDate,
            EndDate = endDate,
            Status = "Active",
            MaxBookingPerCustomer = 1
        };

        var slot = new CreateSlotRequest
        {
            OfferId = 0,
            SlotDate = slotDate,
            StartTime = slotStart,
            EndTime = slotEnd,
            Capacity = request.Capacity
        };

        return (business, offer, slot);
    }

    private static TimeOnly ParseTime(string? value, string fieldName)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException($"{fieldName} is required");

        var normalized = value.Trim();
        if (TimeOnly.TryParse(normalized, out var time))
            return time;

        if (normalized.Length == 5 && TimeOnly.TryParse(normalized + ":00", out time))
            return time;

        throw new ArgumentException($"{fieldName} must be a valid time (e.g. 09:00)");
    }

    private static DateTime ParseDate(string? value, string fieldName)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException($"{fieldName} is required");

        if (DateTime.TryParse(value.Trim(), out var date))
            return DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);

        throw new ArgumentException($"{fieldName} must be a valid date (YYYY-MM-DD)");
    }
}
