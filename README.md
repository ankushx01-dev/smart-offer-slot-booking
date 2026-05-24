# Smart Offer Slot Booking System

Fullstack hackathon project: businesses create limited-time offer slots; customers book via a public page.

## Tech stack

| Layer | Stack |
|-------|--------|
| Frontend | React, TypeScript, Tailwind CSS, Vite |
| Backend | .NET 8 Web API, EF Core, JWT |
| Database | PostgreSQL |
| API docs | Swagger at `/swagger` |

## Quick start

### Prerequisites

- .NET 8 SDK
- Node.js 18+
- PostgreSQL running locally

### 1. Backend

```bash
cd backend/SmartOfferSlotBooking
copy .env.example .env
# Edit .env if PostgreSQL credentials differ

dotnet restore
dotnet run --urls http://localhost:5000
```

- API: http://localhost:5000  
- Swagger: http://localhost:5000/swagger  
- DB is created and seeded on first run

### 2. Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

- App: http://localhost:5173  

### Demo logins (password: `Admin@123`)

| Email | Use |
|-------|-----|
| `admin@smartoffer.com` | Main gym demo with offers & slots |
| `admin@gmail.com` | Hackathon admin (auto-seeded if missing) |

Per-type demos (password `Demo@123`): `restaurant@demo.smartoffer.local`, `salon@demo.smartoffer.local`, etc.

## Screens (all implemented)

| # | Screen | Route |
|---|--------|-------|
| 1 | Admin login | `/admin/login` |
| 2 | Admin dashboard | `/admin/dashboard` |
| 3 | Create offer | `/admin/offers/new` |
| 4 | Edit / manage offers | `/admin/offers`, `/admin/offers/:id/edit` |
| 5 | Manage bookings | `/admin/bookings` |
| 6 | Business profile | `/admin/business` |
| 7 | Public listing | `/` |
| 8 | Offer detail + book | `/offers/:id` |
| 9 | Booking confirmation | `/booking/confirmation/:reference` |

## Required APIs

All hackathon endpoints are implemented — see Swagger or `IMPLEMENTATION_GUIDE.md`.

## Business rules

- Offer price &lt; original price  
- Expired / cancelled offers hidden from public  
- Slot capacity and per-phone booking limits enforced  
- `BookedCount` updates on booking; released on cancel  
- Unique booking reference (`BK-YYYYMMDD-XXXXXX`)

## Bonus features

- Expiry countdown on offer cards  
- QR code on confirmation page  
- CSV export (Manage Bookings)  
- Public filters: business type, category, date, price, available only  

## Submission checklist

- [ ] Public GitHub repo  
- [ ] This README + `.env.example` files  
- [ ] Screenshot: public listing, offer detail, confirmation, admin dashboard, Swagger  
- [ ] `DATABASE_SCHEMA.md` or ER diagram  
- [ ] 2–3 min demo video  

## Schema

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md).

## License

MIT — hackathon submission for Willovate Smart Offer Slot Booking.
