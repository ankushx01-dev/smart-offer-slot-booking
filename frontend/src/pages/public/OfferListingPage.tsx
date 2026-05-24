import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import OfferCard from '../../components/OfferCard';
import ThemeToggle from '../../components/ThemeToggle';
import { BUSINESS_TYPES } from '../../constants/businessTypes';
import { offersApi } from '../../services/api';
import type { Offer } from '../../types';

const ALL_CATEGORIES = [
  'Lunch Deal',
  'Trial',
  'Consultation',
  'Trial Class',
  'Hourly Slot',
  'Membership',
  'Spa Package',
  'Other',
];

export default function OfferListingPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('');
  const [category, setCategory] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string | number | boolean> = {};
    if (activeType) params.businessType = activeType;
    if (category) params.category = category;
    if (filterDate) params.date = filterDate;
    if (minPrice) params.minPrice = Number(minPrice);
    if (maxPrice) params.maxPrice = Number(maxPrice);
    if (availableOnly) params.availableOnly = true;

    offersApi
      .getPublic(params)
      .then((res) => setOffers(res.data))
      .catch(() => setOffers([]))
      .finally(() => setLoading(false));
  }, [activeType, category, filterDate, minPrice, maxPrice, availableOnly]);

  useEffect(() => {
    load();
  }, [load]);

  const grouped = useMemo(() => {
    const map = new Map<string, Offer[]>();
    for (const type of BUSINESS_TYPES) {
      map.set(type, []);
    }
    for (const offer of offers) {
      const type = offer.business?.businessType || 'Other';
      if (!map.has(type)) map.set(type, []);
      map.get(type)!.push(offer);
    }
    return map;
  }, [offers]);

  const showGrouped = !activeType;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight text-primary sm:text-xl">
              Smart Offer Slots
            </h1>
            <p className="truncate text-xs text-slate-500 dark:text-zinc-400 sm:text-sm">
              Book limited-time deals near you
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <div className="hidden h-6 w-px bg-slate-200 dark:bg-zinc-700 sm:block" aria-hidden />
            <ThemeToggle />
            <Link
              to="/admin/login"
              className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:px-4 sm:text-sm"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-b from-slate-200 via-slate-400 to-slate-600 px-4 py-16 text-center dark:from-zinc-600 dark:via-zinc-900 dark:to-[#1a1a1a] sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-5xl">
            Unlock Exclusive Offers &amp; Book Your Perfect Slot
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-700 dark:text-zinc-300 sm:text-lg">
            Welcome to your hub for smart local deals. Browse curated offers from gyms,
            salons, restaurants, and more — then reserve limited slots before they&apos;re gone.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
          <p className="mb-4 text-sm font-semibold text-slate-700 dark:text-zinc-200">Filters</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <label className="block text-left text-xs font-medium text-slate-500 dark:text-zinc-400">
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-2 w-full rounded-lg border-slate-300 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="">All categories</option>
                {ALL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-left text-xs font-medium text-slate-500 dark:text-zinc-400">
              Slot date
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="mt-2 w-full rounded-lg border-slate-300 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </label>
            <label className="block text-left text-xs font-medium text-slate-500 dark:text-zinc-400">
              Min price (₹)
              <input
                type="number"
                min={0}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="mt-2 w-full rounded-lg border-slate-300 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </label>
            <label className="block text-left text-xs font-medium text-slate-500 dark:text-zinc-400">
              Max price (₹)
              <input
                type="number"
                min={0}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="mt-2 w-full rounded-lg border-slate-300 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </label>
            <label className="flex items-end gap-2 pb-1 text-left text-sm text-slate-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="rounded border-slate-300 dark:border-zinc-600 dark:bg-zinc-800"
              />
              Available slots only
            </label>
          </div>
        </div>

        <div className="mb-10">
          <p className="mb-3 text-left text-sm font-semibold text-slate-700 dark:text-zinc-200">
            Browse by business type
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveType('')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeType === ''
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-primary dark:bg-zinc-900 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:ring-primary'
              }`}
            >
              All ({offers.length})
            </button>
            {BUSINESS_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setActiveType(type)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeType === type
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-primary dark:bg-zinc-900 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:ring-primary'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="py-16 text-center text-slate-400 dark:text-zinc-500">Loading offers...</p>
        ) : !offers.length ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-lg font-semibold text-slate-600 dark:text-zinc-300">
              No offers match your filters
            </p>
            <p className="mt-2 text-sm text-slate-400 dark:text-zinc-500">
              Try clearing filters or check back when new active offers are published.
            </p>
          </div>
        ) : showGrouped ? (
          <div className="space-y-12">
            {BUSINESS_TYPES.map((type) => {
              const sectionOffers = grouped.get(type) ?? [];
              if (!sectionOffers.length) return null;
              return (
                <section key={type}>
                  <div className="mb-5 flex items-center gap-2 text-left">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100">{type}</h2>
                    <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {sectionOffers.length} offer{sectionOffers.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {sectionOffers.map((offer) => (
                      <OfferCard key={offer.id} offer={offer} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
