export const BUSINESS_TYPES = [
  'Restaurant',
  'Gym',
  'Salon',
  'Clinic',
  'Coaching',
  'Turf',
  'Spa',
  'Other',
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];

export const OFFER_CATEGORIES_BY_BUSINESS_TYPE: Record<BusinessType, string[]> = {
  Restaurant: ['Lunch Deal', 'Dinner Special', 'Buffet', 'Trial', 'Other'],
  Gym: ['Trial', 'Membership', 'Personal Training', 'Class Pack', 'Other'],
  Salon: ['Haircut', 'Spa Package', 'Bridal', 'Trial', 'Other'],
  Clinic: ['Consultation', 'Health Checkup', 'Dental', 'Trial', 'Other'],
  Coaching: ['Trial Class', 'Course Package', 'Workshop', 'Exam Prep', 'Other'],
  Turf: ['Hourly Slot', 'Tournament', 'Training', 'Trial', 'Other'],
  Spa: ['Massage', 'Facial', 'Wellness Package', 'Trial', 'Other'],
  Other: ['Trial', 'Package', 'Special', 'Other'],
};

export function getOfferCategoriesForType(businessType: string): string[] {
  const key = BUSINESS_TYPES.find((t) => t.toLowerCase() === businessType.toLowerCase());
  return key ? OFFER_CATEGORIES_BY_BUSINESS_TYPE[key] : OFFER_CATEGORIES_BY_BUSINESS_TYPE.Other;
}

export function getDemoPasswordForCategory(businessType: string): string {
  return businessType === 'Gym' ? 'Admin@123' : 'Demo@123';
}
