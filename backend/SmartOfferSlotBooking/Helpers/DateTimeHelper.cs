namespace SmartOfferSlotBooking.Helpers;

public static class DateTimeHelper
{
    public static DateTime ToUtcDate(DateTime value) =>
        DateTime.SpecifyKind(value.Date, DateTimeKind.Utc);
}
