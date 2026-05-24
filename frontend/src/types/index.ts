export interface LoginResponse {
  userId: number;
  name: string;
  email: string;
  role: string;
  businessType?: string;
  businessName?: string;
  token: string;
  expiresAt: string;
}

export interface AdminCategoryOption {
  businessType: string;
  businessName: string;
  adminEmail: string;
  ownerName: string;
}

export interface Business {
  id: number;
  name: string;
  businessType: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  logoUrl?: string;
  openingTime: string;
  closingTime: string;
}

export interface Offer {
  id: number;
  businessId: number;
  title: string;
  description: string;
  category: string;
  originalPrice: number;
  offerPrice: number;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  termsAndConditions?: string;
  status: string;
  maxBookingPerCustomer: number;
  availableSlotsCount?: number;
  business?: Business;
}

export interface Slot {
  id: number;
  offerId: number;
  slotDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  availableCount: number;
  status: string;
}

export interface Booking {
  id: number;
  bookingReference: string;
  offerId: number;
  slotId: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  peopleCount: number;
  specialNote?: string;
  status: string;
  offerTitle?: string;
  businessName?: string;
  offer?: Offer;
  slot?: Slot;
  createdAt: string;
}

export interface DashboardSummary {
  totalOffers: number;
  activeOffers: number;
  totalBookings: number;
  todaysBookings: number;
  totalCapacity: number;
  bookedSeats: number;
  availableSeats: number;
  conversionRate: number;
  recentBookings: Booking[];
}
