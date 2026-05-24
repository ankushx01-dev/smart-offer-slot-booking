namespace SmartOfferSlotBooking.Constants;

public static class BusinessTypes
{
    public static readonly string[] All =
    [
        "Restaurant",
        "Gym",
        "Salon",
        "Clinic",
        "Coaching",
        "Turf",
        "Spa",
        "Other"
    ];

    public static readonly Dictionary<string, string[]> OfferCategoriesByType = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Restaurant"] = ["Lunch Deal", "Dinner Special", "Buffet", "Trial", "Other"],
        ["Gym"] = ["Trial", "Membership", "Personal Training", "Class Pack", "Other"],
        ["Salon"] = ["Haircut", "Spa Package", "Bridal", "Trial", "Other"],
        ["Clinic"] = ["Consultation", "Health Checkup", "Dental", "Trial", "Other"],
        ["Coaching"] = ["Trial Class", "Course Package", "Workshop", "Exam Prep", "Other"],
        ["Turf"] = ["Hourly Slot", "Tournament", "Training", "Trial", "Other"],
        ["Spa"] = ["Massage", "Facial", "Wellness Package", "Trial", "Other"],
        ["Other"] = ["Trial", "Package", "Special", "Other"]
    };

    public static bool IsValid(string? value) =>
        !string.IsNullOrWhiteSpace(value) &&
        All.Contains(value, StringComparer.OrdinalIgnoreCase);

    public static string Normalize(string value) =>
        All.First(t => t.Equals(value, StringComparison.OrdinalIgnoreCase));

    public static bool IsValidCategory(string businessType, string? category)
    {
        if (string.IsNullOrWhiteSpace(category)) return false;
        return OfferCategoriesByType.TryGetValue(businessType, out var categories) &&
               categories.Contains(category, StringComparer.OrdinalIgnoreCase);
    }
}
