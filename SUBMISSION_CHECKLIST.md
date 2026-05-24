# Hackathon submission checklist

## Before you submit

1. **GitHub** — push to a **public** repository.
2. **README** — setup steps work on a fresh machine (PostgreSQL + .NET + Node).
3. **`.env.example`** — root, `frontend/`, and `backend/SmartOfferSlotBooking/`.
4. **Screenshots** — save under `docs/screenshots/`:
   - Public offer listing (with filters)
   - Offer detail + booking form
   - Booking confirmation + QR
   - Admin dashboard
   - Swagger UI
5. **Database** — include `DATABASE_SCHEMA.md` or an ER diagram image.
6. **Demo video** (2–3 min) — cover:
   - Admin login → create offer + slot
   - Public browse → book → confirmation
   - Admin update booking status

## Demo script (suggested)

1. Open http://localhost:5173 — show filters and offer cards.
2. Book a slot with name + phone → confirmation reference.
3. Login http://localhost:5173/admin/login — `admin@smartoffer.com` / `Admin@123`.
4. Dashboard stats + recent bookings status change.
5. Swagger http://localhost:5000/swagger — show `POST /api/bookings`.

## Accounts

| Role | Email | Password |
|------|-------|----------|
| Gym admin | admin@smartoffer.com | Admin@123 |
| Hackathon admin | admin@gmail.com | Admin@123 |
| Type demos | `{type}@demo.smartoffer.local` | Demo@123 |

## Run commands

```powershell
# Terminal 1
cd backend\SmartOfferSlotBooking
dotnet run --urls http://localhost:5000

# Terminal 2
cd frontend
npm run dev
```
