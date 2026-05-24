using Microsoft.EntityFrameworkCore;
using SmartOfferSlotBooking.Models;

namespace SmartOfferSlotBooking.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Business> Businesses { get; set; } = null!;
    public DbSet<Offer> Offers { get; set; } = null!;
    public DbSet<OfferSlot> OfferSlots { get; set; } = null!;
    public DbSet<Booking> Bookings { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.HasOne(u => u.Business)
                .WithOne(b => b.User)
                .HasForeignKey<Business>(b => b.UserId);
        });

        modelBuilder.Entity<Business>(entity =>
        {
            entity.HasKey(b => b.Id);
            entity.HasMany(b => b.Offers)
                .WithOne(o => o.Business)
                .HasForeignKey(o => o.BusinessId);
        });

        modelBuilder.Entity<Offer>(entity =>
        {
            entity.HasKey(o => o.Id);
            entity.HasMany(o => o.Slots)
                .WithOne(s => s.Offer)
                .HasForeignKey(s => s.OfferId);
        });

        modelBuilder.Entity<OfferSlot>(entity =>
        {
            entity.HasKey(s => s.Id);
            entity.Ignore(s => s.AvailableCount);
        });

        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(b => b.Id);
            entity.HasIndex(b => b.BookingReference).IsUnique();
            entity.HasOne(b => b.Offer)
                .WithMany()
                .HasForeignKey(b => b.OfferId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(b => b.Slot)
                .WithMany()
                .HasForeignKey(b => b.SlotId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
