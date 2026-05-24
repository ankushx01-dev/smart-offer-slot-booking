using Microsoft.EntityFrameworkCore;
using SmartOfferSlotBooking.Constants;
using SmartOfferSlotBooking.Models;
using SmartOfferSlotBooking.Services;

namespace SmartOfferSlotBooking.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(ApplicationDbContext context, IAuthService authService)
    {
        await context.Database.EnsureCreatedAsync();

        if (!await context.Users.AnyAsync())
        {
            await SeedAdminAndGymAsync(context, authService);
        }

        await EnsureHackathonAdminAsync(context, authService);
        await SeedDemoBusinessesPerTypeAsync(context, authService);
        await EnsureBusinessForAdminsAsync(context, authService);
        await RefreshDemoAvailabilityAsync(context);
    }

    /// <summary>
    /// Keeps seeded demo offers bookable during local development when the DB persists across days.
    /// </summary>
    private static async Task RefreshDemoAvailabilityAsync(ApplicationDbContext context)
    {
        var today = DateTime.UtcNow.Date;

        var expiredActiveOffers = await context.Offers
            .Where(o => o.Status == "Active" && o.EndDate < today)
            .ToListAsync();

        foreach (var offer in expiredActiveOffers)
        {
            offer.StartDate = today;
            offer.EndDate = today.AddDays(30);
            offer.UpdatedAt = DateTime.UtcNow;
        }

        var staleSlots = await context.OfferSlots
            .Where(s => s.SlotDate < today && s.Status != "Cancelled")
            .ToListAsync();

        foreach (var slot in staleSlots)
        {
            slot.SlotDate = today.AddDays(1);
            if (slot.BookedCount < slot.Capacity && slot.Status != "Full")
                slot.Status = "Available";
            slot.UpdatedAt = DateTime.UtcNow;
        }

        if (expiredActiveOffers.Count > 0 || staleSlots.Count > 0)
            await context.SaveChangesAsync();
    }

    private static async Task EnsureHackathonAdminAsync(ApplicationDbContext context, IAuthService authService)
    {
        const string email = "admin@gmail.com";
        if (await context.Users.AnyAsync(u => u.Email.ToLower() == email))
            return;

        var user = new User
        {
            Name = "Hackathon Admin",
            Email = email,
            PasswordHash = authService.HashPassword("Admin@123"),
            Role = "Admin"
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var business = new Business
        {
            UserId = user.Id,
            Name = "FitLife Gym",
            BusinessType = "Gym",
            OwnerName = "Hackathon Admin",
            Phone = "9876543210",
            Email = email,
            Address = "123 Main Street",
            City = "Mumbai",
            OpeningTime = new TimeOnly(6, 0),
            ClosingTime = new TimeOnly(22, 0)
        };
        context.Businesses.Add(business);
        await context.SaveChangesAsync();

        await AddActiveOfferWithSlotAsync(
            context,
            business.Id,
            "Afternoon Gym Trial",
            "Try our premium gym facilities at a special price.",
            "Trial",
            499,
            99);
    }

    private static async Task SeedAdminAndGymAsync(ApplicationDbContext context, IAuthService authService)
    {
        var admin = new User
        {
            Name = "Admin User",
            Email = "admin@smartoffer.com",
            PasswordHash = authService.HashPassword("Admin@123"),
            Role = "Admin"
        };

        context.Users.Add(admin);
        await context.SaveChangesAsync();

        var business = new Business
        {
            UserId = admin.Id,
            Name = "FitLife Gym",
            BusinessType = "Gym",
            OwnerName = "Admin User",
            Phone = "9876543210",
            Email = "admin@smartoffer.com",
            Address = "123 Main Street",
            City = "Mumbai",
            OpeningTime = new TimeOnly(6, 0),
            ClosingTime = new TimeOnly(22, 0)
        };

        context.Businesses.Add(business);
        await context.SaveChangesAsync();

        await AddActiveOfferWithSlotAsync(
            context,
            business.Id,
            "Afternoon Gym Trial",
            "Try our premium gym facilities at a special price.",
            "Trial",
            499,
            99);
    }

    private static async Task SeedDemoBusinessesPerTypeAsync(ApplicationDbContext context, IAuthService authService)
    {
        var demos = new (string Type, string Name, string OfferTitle, string Category, decimal Original, decimal Offer)[]
        {
            ("Restaurant", "Spice Route Kitchen", "Weekend Lunch Buffet", "Buffet", 799, 399),
            ("Salon", "Glow Studio Salon", "Haircut + Styling Package", "Haircut", 1200, 599),
            ("Clinic", "CareFirst Clinic", "Full Body Checkup", "Health Checkup", 2500, 1499),
            ("Coaching", "BrightMinds Coaching", "JEE Foundation Trial", "Trial Class", 999, 199),
            ("Turf", "GreenField Turf", "Evening Turf Slot", "Hourly Slot", 1500, 750),
            ("Spa", "Serenity Spa", "Weekend Wellness Package", "Wellness Package", 2000, 999),
            ("Other", "City Services Hub", "Intro Service Package", "Package", 600, 299)
        };

        foreach (var demo in demos)
        {
            var hasActiveOffer = await context.Offers
                .Include(o => o.Business)
                .AnyAsync(o =>
                    o.Status == "Active" &&
                    o.Business != null &&
                    o.Business.BusinessType == demo.Type);

            if (hasActiveOffer)
                continue;

            var user = new User
            {
                Name = $"{demo.Type} Demo Owner",
                Email = $"{demo.Type.ToLowerInvariant()}@demo.smartoffer.local",
                PasswordHash = authService.HashPassword("Demo@123"),
                Role = "Admin"
            };
            context.Users.Add(user);
            await context.SaveChangesAsync();

            var business = new Business
            {
                UserId = user.Id,
                Name = demo.Name,
                BusinessType = demo.Type,
                OwnerName = user.Name,
                Phone = "9000000001",
                Email = user.Email,
                Address = "Demo Street",
                City = "Mumbai",
                OpeningTime = new TimeOnly(9, 0),
                ClosingTime = new TimeOnly(21, 0)
            };
            context.Businesses.Add(business);
            await context.SaveChangesAsync();

            await AddActiveOfferWithSlotAsync(
                context,
                business.Id,
                demo.OfferTitle,
                $"Sample offer for {demo.Type} businesses.",
                demo.Category,
                demo.Original,
                demo.Offer);
        }
    }

    private static async Task AddActiveOfferWithSlotAsync(
        ApplicationDbContext context,
        int businessId,
        string title,
        string description,
        string category,
        decimal originalPrice,
        decimal offerPrice)
    {
        var offer = new Offer
        {
            BusinessId = businessId,
            Title = title,
            Description = description,
            Category = category,
            OriginalPrice = originalPrice,
            OfferPrice = offerPrice,
            DiscountPercentage = originalPrice > 0
                ? Math.Round((originalPrice - offerPrice) / originalPrice * 100, 2)
                : 0,
            StartDate = DateTime.UtcNow.Date,
            EndDate = DateTime.UtcNow.Date.AddDays(30),
            TermsAndConditions = "Demo offer for showcase.",
            Status = "Active",
            MaxBookingPerCustomer = 1
        };

        context.Offers.Add(offer);
        await context.SaveChangesAsync();

        context.OfferSlots.Add(new OfferSlot
        {
            OfferId = offer.Id,
            SlotDate = DateTime.UtcNow.Date.AddDays(1),
            StartTime = new TimeOnly(10, 0),
            EndTime = new TimeOnly(11, 0),
            Capacity = 10,
            Status = "Available"
        });

        await context.SaveChangesAsync();
    }

    private static async Task EnsureBusinessForAdminsAsync(ApplicationDbContext context, IAuthService authService)
    {
        var admins = await context.Users.Where(u => u.Role == "Admin").ToListAsync();
        foreach (var user in admins)
        {
            var hasBusiness = await context.Businesses.AnyAsync(b => b.UserId == user.Id);
            if (hasBusiness) continue;

            var business = new Business
            {
                UserId = user.Id,
                Name = string.IsNullOrWhiteSpace(user.Name) ? "Admin Business" : user.Name + "'s Business",
                BusinessType = "Gym",
                OwnerName = string.IsNullOrWhiteSpace(user.Name) ? "Admin" : user.Name,
                Phone = "9000000000",
                Email = user.Email,
                Address = "Auto-created business",
                City = "Mumbai",
                OpeningTime = new TimeOnly(9, 0),
                ClosingTime = new TimeOnly(21, 0)
            };

            context.Businesses.Add(business);
            await context.SaveChangesAsync();

            await AddActiveOfferWithSlotAsync(
                context,
                business.Id,
                "Welcome Offer",
                "Auto-created demo offer for admin",
                "Trial",
                499,
                99);
        }
    }
}
