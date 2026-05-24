# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Clone & Navigate
```bash
git clone <your-repo-url>
cd smart-offer-slot-booking
```

### Step 2: Install Dependencies

**Backend:**
```bash
cd backend/SmartOfferSlotBooking
dotnet restore
cd ../..
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

### Step 3: Setup Database

**PostgreSQL:**
```bash
# Create database
psql -U postgres -c "CREATE DATABASE \"SmartOfferSlotDB\";"
```

**Apply Migrations:**
```bash
cd backend/SmartOfferSlotBooking
dotnet ef database update
cd ../..
```

### Step 4: Configure Environment

**Backend:**
```bash
cd backend/SmartOfferSlotBooking
cp ../../.env.example .env
# Edit .env if needed (defaults should work locally)
cd ../..
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
cd ..
```

### Step 5: Start Services

**Terminal 1 - Backend:**
```bash
cd backend/SmartOfferSlotBooking
dotnet run
# Runs on http://localhost:5000
# API Docs: http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### Step 6: Access Application

- **Frontend:** http://localhost:5173
- **API Docs:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

---

## 📋 Available Scripts

### Backend
```bash
dotnet run                    # Run development server
dotnet build                  # Build project
dotnet test                   # Run tests (when added)
dotnet ef migrations add      # Create new migration
dotnet ef database update     # Apply migrations
```

### Frontend
```bash
npm run dev                   # Start development server
npm run build                 # Build for production
npm run lint                  # Run ESLint
npm run type-check           # Check TypeScript types
npm run preview              # Preview production build
```

---

## 🔑 Demo Credentials

Since we haven't created a user registration endpoint yet, you'll need to:

1. **Create admin user in PostgreSQL:**
```sql
INSERT INTO users (name, email, password_hash, role) 
VALUES ('Admin User', 'admin@example.com', 'hashed_password_here', 'Admin');
```

2. **Hash your password first** (use a tool or the backend code)

Or wait for the API controllers to be created which will include a registration endpoint.

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Database connection successful
- [ ] Can access Swagger API docs
- [ ] Health check returns healthy status

---

## 🐛 Common Issues

### Port Already in Use
```bash
# Backend (port 5000)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Frontend (port 5173)
npm run dev -- --port 3000
```

### Database Connection Failed
- Verify PostgreSQL is running
- Check connection string in .env
- Ensure database exists: `SmartOfferSlotDB`

### npm install fails
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### .NET restore fails
```bash
cd backend/SmartOfferSlotBooking
dotnet clean
dotnet restore
```

---

## 📚 Next Steps

1. Review `ARCHITECTURE.md` for system design
2. Check `DATABASE_SCHEMA.md` for data models
3. Explore API endpoints in Swagger documentation
4. Start building controllers (see TODO below)

---

## 🎯 Project TODO

### Phase 1: API Controllers (In Progress)
- [ ] AuthController - Login endpoint
- [ ] BusinessController - CRUD operations
- [ ] OfferController - Offer management
- [ ] SlotController - Slot management
- [ ] BookingController - Booking operations
- [ ] DashboardController - Summary metrics

### Phase 2: Frontend Pages
- [ ] Login page
- [ ] Admin dashboard
- [ ] Offer management pages
- [ ] Public listing pages
- [ ] Booking pages

### Phase 3: Testing
- [ ] API integration tests
- [ ] Frontend component tests
- [ ] End-to-end tests

### Phase 4: Deployment
- [ ] Docker setup
- [ ] Production deployment guide
- [ ] Performance optimization
- [ ] Security hardening

---

## 📞 Support

For issues or questions:
1. Check ARCHITECTURE.md for design details
2. Review DATABASE_SCHEMA.md for data models
3. Check Swagger documentation for API specs
4. Review git commit history for context

Happy coding! 🎉
