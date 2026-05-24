import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { bookingsApi } from '../../services/api';
import type { Booking } from '../../types';

export default function BookingConfirmationPage() {
  const { reference } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!reference) return;
    setError('');
    bookingsApi
      .getByReference(decodeURIComponent(reference))
      .then((res) => setBooking(res.data))
      .catch(() => setError('Booking not found. Check your reference number.'));
  }, [reference]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <p className="text-red-600">{error}</p>
        <Link to="/" className="text-primary hover:underline">
          Browse offers
        </Link>
      </div>
    );
  }

  if (!booking) return <p className="p-8 text-center">Loading confirmation...</p>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-slate-100 p-4 dark:from-zinc-950 dark:to-zinc-900">
      <div className="ui-card w-full max-w-lg p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
          ✓
        </div>
        <h1 className="mb-2 text-2xl font-bold text-green-700">Booking Confirmed!</h1>
        <p className="mb-6 font-mono text-lg text-primary">{booking.bookingReference}</p>
        <div className="mb-6 space-y-2 text-left text-sm text-slate-700 dark:text-zinc-300">
          <p>
            <strong className="text-slate-900 dark:text-zinc-100">Offer:</strong>{' '}
            {booking.offerTitle ?? booking.offer?.title}
          </p>
          <p>
            <strong className="text-slate-900 dark:text-zinc-100">Business:</strong> {booking.businessName ?? booking.offer?.business?.name}
          </p>
          <p>
            <strong className="text-slate-900 dark:text-zinc-100">Slot:</strong> {booking.slot?.slotDate} {booking.slot?.startTime} -{' '}
            {booking.slot?.endTime}
          </p>
          <p>
            <strong className="text-slate-900 dark:text-zinc-100">Customer:</strong> {booking.customerName}
          </p>
          <p>
            <strong className="text-slate-900 dark:text-zinc-100">Status:</strong>{' '}
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-800">
              {booking.status}
            </span>
          </p>
        </div>
        <div className="mb-6 flex justify-center">
          <QRCodeSVG value={booking.bookingReference} size={120} />
        </div>
        <Link
          to="/"
          className="inline-block rounded-lg bg-primary px-6 py-2 text-white hover:bg-blue-700"
        >
          Browse More Offers
        </Link>
      </div>
    </div>
  );
}
