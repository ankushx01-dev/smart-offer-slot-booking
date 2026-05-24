import type { Booking } from '../types';

export function exportBookingsCsv(bookings: Booking[], filename = 'bookings.csv') {
  const headers = [
    'Reference',
    'Customer',
    'Phone',
    'Offer',
    'Slot Date',
    'Slot Time',
    'People',
    'Status',
    'Created',
  ];

  const rows = bookings.map((b) => [
    b.bookingReference,
    b.customerName,
    b.customerPhone,
    b.offerTitle ?? b.offer?.title ?? '',
    b.slot?.slotDate ?? '',
    b.slot ? `${b.slot.startTime}-${b.slot.endTime}` : '',
    String(b.peopleCount),
    b.status,
    b.createdAt ?? '',
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
