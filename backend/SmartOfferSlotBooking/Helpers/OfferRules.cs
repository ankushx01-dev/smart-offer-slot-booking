using SmartOfferSlotBooking.Models;

namespace SmartOfferSlotBooking.Helpers;

public static class OfferRules
{
    public static bool IsPubliclyVisible(Offer offer) =>
        offer.Status == "Active"
        && offer.StartDate.Date <= DateTime.UtcNow.Date
        && offer.EndDate.Date >= DateTime.UtcNow.Date;

    public static bool IsBookable(Offer offer) => IsPubliclyVisible(offer);
}
