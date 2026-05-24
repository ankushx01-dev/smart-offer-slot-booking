using Microsoft.EntityFrameworkCore;
using SmartOfferSlotBooking.Constants;
using SmartOfferSlotBooking.Data;
using SmartOfferSlotBooking.DTOs;
using SmartOfferSlotBooking.Models;

namespace SmartOfferSlotBooking.Services;

public interface IBusinessService
{
    Task<BusinessResponse?> GetByUserIdAsync(int userId);
    Task<BusinessResponse?> GetByIdAsync(int id);
    Task<BusinessResponse> CreateAsync(int userId, CreateBusinessRequest request);
    Task<BusinessResponse> UpdateAsync(int id, int userId, UpdateBusinessRequest request);
    Task<BusinessResponse> UpsertForUserAsync(int userId, CreateBusinessRequest request);
}

public class BusinessService : IBusinessService
{
    private readonly ApplicationDbContext _context;

    public BusinessService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<BusinessResponse?> GetByUserIdAsync(int userId)
    {
        var business = await _context.Businesses.FirstOrDefaultAsync(b => b.UserId == userId);
        return business == null ? null : Map(business);
    }

    public async Task<BusinessResponse?> GetByIdAsync(int id)
    {
        var business = await _context.Businesses.FirstOrDefaultAsync(b => b.Id == id);
        return business == null ? null : Map(business);
    }

    public async Task<BusinessResponse> UpsertForUserAsync(int userId, CreateBusinessRequest request)
    {
        ValidateRequest(request);

        var existing = await _context.Businesses.FirstOrDefaultAsync(b => b.UserId == userId);
        if (existing == null)
            return await CreateAsync(userId, request);

        return await UpdateAsync(existing.Id, userId, new UpdateBusinessRequest
        {
            Name = request.Name,
            BusinessType = request.BusinessType,
            OwnerName = request.OwnerName,
            Phone = request.Phone,
            Email = request.Email,
            Address = request.Address,
            City = request.City,
            LogoUrl = string.IsNullOrWhiteSpace(request.LogoUrl) ? null : request.LogoUrl,
            OpeningTime = request.OpeningTime,
            ClosingTime = request.ClosingTime
        });
    }

    public async Task<BusinessResponse> CreateAsync(int userId, CreateBusinessRequest request)
    {
        ValidateRequest(request);

        if (await _context.Businesses.AnyAsync(b => b.UserId == userId))
            throw new InvalidOperationException("Business profile already exists for this user");

        var business = new Business
        {
            UserId = userId,
            Name = request.Name,
            BusinessType = BusinessTypes.Normalize(request.BusinessType),
            OwnerName = request.OwnerName,
            Phone = request.Phone,
            Email = request.Email,
            Address = request.Address,
            City = request.City,
            LogoUrl = request.LogoUrl,
            OpeningTime = request.OpeningTime,
            ClosingTime = request.ClosingTime
        };

        _context.Businesses.Add(business);
        await _context.SaveChangesAsync();
        return Map(business);
    }

    public async Task<BusinessResponse> UpdateAsync(int id, int userId, UpdateBusinessRequest request)
    {
        var business = await _context.Businesses.FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
        if (business == null)
            throw new KeyNotFoundException($"Business {id} not found");

        if (request.BusinessType != null && !BusinessTypes.IsValid(request.BusinessType))
            throw new ArgumentException($"Invalid business type. Allowed: {string.Join(", ", BusinessTypes.All)}");

        if (request.Name != null) business.Name = request.Name;
        if (request.BusinessType != null) business.BusinessType = BusinessTypes.Normalize(request.BusinessType);
        if (request.OwnerName != null) business.OwnerName = request.OwnerName;
        if (request.Phone != null) business.Phone = request.Phone;
        if (request.Email != null) business.Email = request.Email;
        if (request.Address != null) business.Address = request.Address;
        if (request.City != null) business.City = request.City;
        if (request.LogoUrl != null) business.LogoUrl = string.IsNullOrWhiteSpace(request.LogoUrl) ? null : request.LogoUrl;
        if (request.OpeningTime.HasValue) business.OpeningTime = request.OpeningTime.Value;
        if (request.ClosingTime.HasValue) business.ClosingTime = request.ClosingTime.Value;
        business.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Map(business);
    }

    private static void ValidateRequest(CreateBusinessRequest request)
    {
        if (!BusinessTypes.IsValid(request.BusinessType))
            throw new ArgumentException($"Invalid business type. Allowed: {string.Join(", ", BusinessTypes.All)}");
    }

    private static BusinessResponse Map(Business business) => new()
    {
        Id = business.Id,
        Name = business.Name,
        BusinessType = business.BusinessType,
        OwnerName = business.OwnerName,
        Phone = business.Phone,
        Email = business.Email,
        Address = business.Address,
        City = business.City,
        LogoUrl = business.LogoUrl,
        OpeningTime = business.OpeningTime.ToString("HH:mm"),
        ClosingTime = business.ClosingTime.ToString("HH:mm"),
        CreatedAt = business.CreatedAt,
        UpdatedAt = business.UpdatedAt
    };
}
