# Architecture & Setup Guide

## Project Structure

```
smart-offer-slot-booking/
├── backend/
│   └── SmartOfferSlotBooking/
│       ├── Models/
│       │   └── DomainModels.cs              # Entity models
│       ├── Controllers/                     # API endpoints (to be created)
│       ├── Services/
│       │   ├── AuthService.cs               # Authentication logic
│       │   ├── OfferService.cs              # Offer business logic
│       │   ├── SlotService.cs               # Slot management logic
│       │   └── BookingService.cs            # Booking logic
│       ├── DTOs/
│       │   └── RequestResponseDTOs.cs       # Request/response models
│       ├── Data/
│       │   └── ApplicationDbContext.cs      # EF Core DbContext
│       ├── Migrations/                      # Database migrations
│       ├── Program.cs                       # App configuration
│       └── SmartOfferSlotBooking.csproj     # Project file
├── frontend/
│   ├── src/
│   │   ├── pages/                           # Page components (to be created)
│   │   ├── components/                      # Reusable components (to be created)
│   │   ├── services/
│   │   │   └── api.ts                       # API client
│   │   ├── hooks/
│   │   │   ├── useAuth.ts                   # Auth state management
│   │   │   └── useAuthGuard.ts              # Auth guards
│   │   ├── types/
│   │   │   └── index.ts                     # TypeScript types
│   │   ├── utils/
│   │   │   └── formatters.ts                # Utility functions
│   │   ├── assets/
│   │   │   └── index.css                    # Tailwind styles
│   │   ├── main.tsx                         # Entry point (to be created)
│   │   └── App.tsx                          # Root component (to be created)
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.example
├── .env.example
├── .gitignore
├── README.md
└── DATABASE_SCHEMA.md
```

## Architecture Overview

### Backend Architecture

**Tech Stack:**
- .NET 8 Web API
- Entity Framework Core 8.0
- PostgreSQL 12+
- JWT Authentication
- Swagger/OpenAPI

**Layers:**

1. **Controllers Layer** (HTTP Request/Response)
   - Handle HTTP requests
   - Route to appropriate services
   - Return standardized responses

2. **Services Layer** (Business Logic)
   - `AuthService` - User authentication and JWT generation
   - `OfferService` - Offer CRUD and filtering
   - `SlotService` - Slot management and availability
   - `BookingService` - Booking creation and status updates

3. **Data Layer** (Database Access)
   - `ApplicationDbContext` - EF Core DbContext
   - Models - Entity definitions
   - Migrations - Database schema versioning

4. **DTOs** (Data Transfer)
   - Request models for API endpoints
   - Response models with serialization control
   - Generic ApiResponse wrapper

### Frontend Architecture

**Tech Stack:**
- React 18+ with TypeScript
- React Router v6
- Tailwind CSS
- Zustand for state management
- Axios for API calls

**Layers:**

1. **Pages** - Full screen components
   - Admin pages (login, dashboard, offer management)
   - Public pages (listing, detail, booking)

2. **Components** - Reusable UI components
   - Base components (Button, Card, Form, Table)
   - Feature components (OfferCard, BookingForm)

3. **Services** - API integration
   - Axios interceptors for auth
   - API methods for each resource

4. **Hooks** - Custom React hooks
   - `useAuth` - Auth state management with Zustand
   - `useAuthGuard` - Route protection

5. **Utils** - Helper functions
   - Date/time formatting
   - Currency formatting
   - Validation functions

### API Design

**RESTful Endpoints:**

```
Authentication:
POST   /api/auth/login

Business:
POST   /api/business
GET    /api/business
PUT    /api/business/{id}

Offers:
POST   /api/offers
GET    /api/offers
GET    /api/offers/public (public access)
GET    /api/offers/{id}
PUT    /api/offers/{id}
DELETE /api/offers/{id}

Slots:
POST   /api/slots
GET    /api/slots
GET    /api/offers/{offerId}/slots
PUT    /api/slots/{id}
DELETE /api/slots/{id}

Bookings:
POST   /api/bookings
GET    /api/bookings
GET    /api/bookings/{id}
PUT    /api/bookings/{id}/status

Dashboard:
GET    /api/dashboard/summary

Health:
GET    /health
```

**Response Format:**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* actual data */ },
  "errors": null
}
```

## Setup Instructions

### Prerequisites

- .NET 8 SDK
- Node.js 18+ & npm
- PostgreSQL 12+
- Git

### 1. Clone Repository

```bash
git clone <repository-url>
cd smart-offer-slot-booking
```

### 2. Backend Setup

```bash
cd backend/SmartOfferSlotBooking

# Copy environment file
cp ../../.env.example .env

# Restore NuGet packages
dotnet restore

# Create database migrations
dotnet ef migrations add InitialCreate

# Apply migrations
dotnet ef database update

# Run backend
dotnet run
# API available at http://localhost:5000
# Swagger at http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Start dev server
npm run dev
# Frontend available at http://localhost:5173
```

## Database Setup

### PostgreSQL Connection String

```
Host=localhost;Port=5432;Database=SmartOfferSlotDB;Username=postgres;Password=postgres
```

### Create Database Manually (if needed)

```sql
CREATE DATABASE "SmartOfferSlotDB";
```

## Environment Variables

### Backend (.env)

```
ASPNETCORE_ENVIRONMENT=Development
ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=SmartOfferSlotDB;Username=postgres;Password=postgres
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_at_least_32_chars_long
JWT_ISSUER=SmartOfferSlotBooking
JWT_AUDIENCE=SmartOfferSlotBookingUsers
```

### Frontend (.env)

```
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME=Smart Offer Slot Booking
VITE_APP_VERSION=1.0.0
```

## Key Design Patterns

### 1. Repository Pattern (Service Layer)
Each entity has a service class handling business logic and data access.

### 2. DTO Pattern
Separate DTOs for requests and responses to control serialization and validation.

### 3. Dependency Injection
Services injected into controllers via constructor (ASP.NET DI container).

### 4. Middleware for Cross-Cutting Concerns
CORS, Authentication, Error handling configured in Program.cs

### 5. Custom Hooks (Frontend)
Encapsulate auth logic and state management in reusable hooks.

## Error Handling

### Backend
- Try-catch blocks in services
- Validation in service methods before database operations
- Standardized error responses via ApiResponse wrapper

### Frontend
- Axios interceptors for 401 handling
- Try-catch in async operations
- User-friendly error messages

## Security Considerations

1. **Authentication**
   - JWT tokens with expiration
   - Password hashing with SHA256
   - Token stored in localStorage (consider httpOnly cookies in production)

2. **Authorization**
   - Business can only access their own offers
   - Admin role checking on endpoints

3. **Data Validation**
   - Input validation on both frontend and backend
   - Business rule enforcement (e.g., offer price < original price)

4. **CORS**
   - Configured to allow frontend origin

## Performance Optimizations

1. **Database Indices**
   - On `offer_slots(offer_id)` and `offer_slots(slot_date)`
   - On `bookings(booking_reference)`, `bookings(customer_phone)`

2. **Frontend**
   - Code splitting via React Router
   - Lazy loading for pages
   - Memoization of components

## Testing Strategy

### Backend
- Unit tests for services
- Integration tests for controllers
- Database tests with test data

### Frontend
- Component tests with React Testing Library
- E2E tests with Cypress/Playwright
- Manual testing of critical flows

## Deployment Checklist

- [ ] Change JWT secret to strong value
- [ ] Update database connection string
- [ ] Set ASPNETCORE_ENVIRONMENT to Production
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up database backups
- [ ] Configure logging and monitoring
- [ ] Enable rate limiting
- [ ] Update frontend API base URL
- [ ] Build frontend with `npm run build`
- [ ] Test all APIs via Swagger

## Next Steps

1. Create API controllers
2. Generate initial database migration
3. Create frontend pages and components
4. Test API endpoints with Swagger/Postman
5. Integrate frontend with backend
6. Test complete user flows
7. Prepare demo and documentation
