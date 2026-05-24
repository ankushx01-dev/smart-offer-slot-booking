# Database Schema Documentation

## Overview
Smart Offer Slot Booking System uses PostgreSQL for data persistence with the following tables:

## Tables

### 1. Users Table
Stores admin/business user credentials and roles.

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Admin', -- Admin, Customer
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id`: Unique user identifier
- `name`: User's full name
- `email`: User's email (unique)
- `password_hash`: SHA256 hashed password
- `role`: User role (Admin/Customer)
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

---

### 2. Businesses Table
Stores business/vendor information.

```sql
CREATE TABLE businesses (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100) NOT NULL, -- Restaurant, Gym, Salon, etc.
    owner_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    logo_url VARCHAR(255),
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id`: Business identifier
- `user_id`: Foreign key to users
- `name`: Business name
- `business_type`: Type of business
- `owner_name`: Business owner name
- `phone`: Contact phone
- `email`: Contact email
- `address`: Physical address
- `city`: City name
- `logo_url`: URL to logo image
- `opening_time`: Daily opening time
- `closing_time`: Daily closing time

---

### 3. Offers Table
Stores offer details and pricing information.

```sql
CREATE TABLE offers (
    id SERIAL PRIMARY KEY,
    business_id INT NOT NULL REFERENCES businesses(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    original_price DECIMAL(10, 2) NOT NULL,
    offer_price DECIMAL(10, 2) NOT NULL,
    discount_percentage DECIMAL(5, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    terms_and_conditions TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft', 
    -- Draft, Active, Paused, Expired, Cancelled
    max_booking_per_customer INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id`: Offer identifier
- `business_id`: Associated business
- `title`: Offer title
- `description`: Offer description
- `category`: Offer category
- `original_price`: Original price
- `offer_price`: Discounted price
- `discount_percentage`: Calculated discount %
- `start_date`: Offer start date
- `end_date`: Offer expiry date
- `terms_and_conditions`: T&C text
- `status`: Current offer status
- `max_booking_per_customer`: Max bookings per customer

---

### 4. OfferSlots Table
Stores individual time slots for offers.

```sql
CREATE TABLE offer_slots (
    id SERIAL PRIMARY KEY,
    offer_id INT NOT NULL REFERENCES offers(id),
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    capacity INT NOT NULL,
    booked_count INT DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'Available',
    -- Available, Full, Closed, Expired, Cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_offer_slots_offer_id ON offer_slots(offer_id);
CREATE INDEX idx_offer_slots_slot_date ON offer_slots(slot_date);
```

**Columns:**
- `id`: Slot identifier
- `offer_id`: Associated offer
- `slot_date`: Date of the slot
- `start_time`: Slot start time
- `end_time`: Slot end time
- `capacity`: Total available seats
- `booked_count`: Number of bookings
- `status`: Slot status

---

### 5. Bookings Table
Stores customer bookings.

```sql
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    booking_reference VARCHAR(50) UNIQUE NOT NULL,
    offer_id INT NOT NULL REFERENCES offers(id),
    slot_id INT NOT NULL REFERENCES offer_slots(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    people_count INT NOT NULL,
    special_note TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    -- Pending, Confirmed, Cancelled, Completed, NoShow
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_booking_reference ON bookings(booking_reference);
CREATE INDEX idx_bookings_customer_phone ON bookings(customer_phone);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
```

**Columns:**
- `id`: Booking identifier
- `booking_reference`: Unique booking reference (BK-YYYYMMDD-XXXXXX)
- `offer_id`: Associated offer
- `slot_id`: Associated slot
- `customer_name`: Customer name
- `customer_phone`: Customer phone
- `customer_email`: Customer email
- `people_count`: Number of people
- `special_note`: Special notes
- `status`: Booking status

---

## Key Relationships

```
Users (1) ---- (Many) Businesses
Businesses (1) ---- (Many) Offers
Offers (1) ---- (Many) OfferSlots
Offers (1) ---- (Many) Bookings
OfferSlots (1) ---- (Many) Bookings
```

## Database Constraints

1. **Business Rules:**
   - `offer_price` < `original_price`
   - `end_date` >= `start_date`
   - `end_time` > `start_time`
   - `capacity` > 0
   - `booked_count` <= `capacity`
   - `discount_percentage` = ((original_price - offer_price) / original_price) * 100

2. **Data Validation:**
   - All prices are DECIMAL(10, 2)
   - All emails are unique and valid
   - All phone numbers are required
   - Status values are constrained to specific values

3. **Indices for Performance:**
   - `offer_slots(offer_id)` - Fast lookup of slots by offer
   - `offer_slots(slot_date)` - Fast filtering by date
   - `bookings(booking_reference)` - Quick lookup by reference
   - `bookings(customer_phone)` - Find bookings by customer
   - `bookings(created_at)` - Recent bookings queries

---

## Entity Relationship Diagram

```
┌──────────────┐
│    Users     │
├──────────────┤
│ id (PK)      │
│ name         │
│ email (UQ)   │
│ password     │
│ role         │
└──────────────┘
       │
       │ 1:M
       ▼
┌──────────────┐
│ Businesses   │
├──────────────┤
│ id (PK)      │
│ user_id (FK) │
│ name         │
│ type         │
│ contact info │
└──────────────┘
       │
       │ 1:M
       ▼
┌──────────────┐         ┌──────────────┐
│   Offers     │◄────────│ OfferSlots   │
├──────────────┤   1:M   ├──────────────┤
│ id (PK)      │         │ id (PK)      │
│ biz_id (FK)  │         │ offer_id(FK) │
│ title        │         │ slot_date    │
│ pricing      │         │ times        │
│ status       │         │ capacity     │
└──────────────┘         │ booked_count │
       │                 └──────────────┘
       │  1:M                    │
       └─────┬────────────────┬──┘
             │                │
             │                │ M:M
             │                └─────┐
             │                      │
             ▼                      ▼
        ┌──────────────┐
        │  Bookings    │
        ├──────────────┤
        │ id (PK)      │
        │ reference(UQ)│
        │ offer_id(FK) │
        │ slot_id (FK) │
        │ customer     │
        │ status       │
        └──────────────┘
```

---

## Sample Data

See migration files for seed data examples.

## Maintenance

- Regular backup of production database
- Monitor indices for query performance
- Archive old bookings periodically
- Purge expired offers after 30 days
