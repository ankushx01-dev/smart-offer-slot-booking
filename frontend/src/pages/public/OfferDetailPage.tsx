import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CountdownTimer from '../../components/CountdownTimer';
import ThemeToggle from '../../components/ThemeToggle';
import { bookingsApi, offersApi, slotsApi } from '../../services/api';
import type { Offer, Slot } from '../../types';
import { getApiErrorMessage } from '../../utils/apiErrors';

export default function OfferDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    slotId: 0,
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    peopleCount: 1,
    specialNote: '',
  });

  useEffect(() => {
    if (!id) return;
    setLoadError('');
    setOffer(null);

    offersApi
      .getById(Number(id))
      .then((res) => {
        if (res.data.status !== 'Active') {
          setLoadError('This offer is not available for booking.');
          return;
        }
        setOffer(res.data);
      })
      .catch(() => setLoadError('Offer not found or no longer available.'));

    slotsApi
      .getByOffer(Number(id))
      .then((res) => {
        const available = res.data.filter(
          (s) => s.status === 'Available' && s.availableCount > 0
        );
        setSlots(available);
        if (available[0]) setForm((f) => ({ ...f, slotId: available[0].id }));
      })
      .catch(() => setSlots([]));
  }, [id]);

  const handleBook = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.slotId) {
      setError('Please select an available slot.');
      return;
    }

    if (form.peopleCount < 1) {
      setError('Number of people must be at least 1.');
      return;
    }

    const selected = slots.find((s) => s.id === form.slotId);
    if (selected && form.peopleCount > selected.availableCount) {
      setError(`Only ${selected.availableCount} seat(s) left in this slot.`);
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await bookingsApi.create({
        slotId: form.slotId,
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        customerEmail: form.customerEmail.trim() || undefined,
        peopleCount: form.peopleCount,
        specialNote: form.specialNote.trim() || undefined,
      });
      navigate(`/booking/confirmation/${encodeURIComponent(data.bookingReference)}`);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Booking failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-8 dark:bg-zinc-950">
        <p className="text-red-600 dark:text-red-400">{loadError}</p>
        <Link to="/" className="text-primary hover:underline">
          Back to offers
        </Link>
      </div>
    );
  }

  if (!offer) {
    return (
      <p className="p-8 text-center text-slate-500 dark:text-zinc-400">Loading offer...</p>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-200">
      <header className="border-b border-slate-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link to="/" className="text-sm font-medium text-primary hover:underline">
            ← Back to offers
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 lg:grid-cols-2">
        <div className="ui-card p-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-zinc-400">{offer.business?.name}</p>
            <CountdownTimer endDate={offer.endDate} />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-zinc-50">{offer.title}</h1>
          <p className="mb-4 text-slate-600 dark:text-zinc-300">{offer.description}</p>
          <div className="mb-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">₹{offer.offerPrice}</span>
            <span className="text-slate-400 line-through dark:text-zinc-500">₹{offer.originalPrice}</span>
            <span className="rounded bg-green-100 px-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-400">
              {Math.round(offer.discountPercentage)}% off
            </span>
          </div>
          <p className="mb-2 text-sm text-slate-700 dark:text-zinc-300">
            <strong className="text-slate-900 dark:text-zinc-100">Location:</strong>{' '}
            {offer.business?.address}, {offer.business?.city}
          </p>
          <p className="mb-4 text-sm text-slate-700 dark:text-zinc-300">
            <strong className="text-slate-900 dark:text-zinc-100">Hours:</strong>{' '}
            {offer.business?.openingTime} - {offer.business?.closingTime}
          </p>
          {offer.termsAndConditions && (
            <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
              <strong className="text-slate-900 dark:text-zinc-100">Terms:</strong>{' '}
              {offer.termsAndConditions}
            </div>
          )}
        </div>
        <form onSubmit={handleBook} className="ui-card p-6">
          <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-zinc-50">Book a Slot</h2>
          {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
          <label className="ui-label mb-4">
            Select Slot
            <select
              required
              value={form.slotId || ''}
              onChange={(e) => setForm({ ...form, slotId: Number(e.target.value) })}
              className="ui-input mt-1"
              disabled={!slots.length}
            >
              {!slots.length ? (
                <option value="">No slots available</option>
              ) : (
                slots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.slotDate} {s.startTime}-{s.endTime} ({s.availableCount} left)
                  </option>
                ))
              )}
            </select>
          </label>
          {!slots.length && (
            <p className="mb-4 text-sm text-amber-600 dark:text-amber-400">
              No available slots for this offer. Check back later or pick another offer.
            </p>
          )}
          <label className="ui-label mb-4">
            Your Name
            <input
              required
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              className="ui-input mt-1"
            />
          </label>
          <label className="ui-label mb-4">
            Phone Number
            <input
              required
              minLength={10}
              value={form.customerPhone}
              onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
              className="ui-input mt-1"
            />
          </label>
          <label className="ui-label mb-4">
            Email (optional)
            <input
              type="email"
              value={form.customerEmail}
              onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
              className="ui-input mt-1"
            />
          </label>
          <label className="ui-label mb-4">
            Number of People
            <input
              type="number"
              min={1}
              required
              value={form.peopleCount}
              onChange={(e) => setForm({ ...form, peopleCount: Number(e.target.value) })}
              className="ui-input mt-1"
            />
          </label>
          <label className="ui-label mb-6">
            Special Note (optional)
            <textarea
              rows={2}
              value={form.specialNote}
              onChange={(e) => setForm({ ...form, specialNote: e.target.value })}
              className="ui-input mt-1"
            />
          </label>
          <button
            type="submit"
            disabled={!slots.length || submitting}
            className="w-full rounded-lg bg-primary py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Booking...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}
