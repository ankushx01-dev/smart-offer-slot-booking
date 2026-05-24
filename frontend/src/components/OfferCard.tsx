import { Link } from 'react-router-dom';
import type { Offer } from '../types';
import CountdownTimer from './CountdownTimer';

export default function OfferCard({ offer }: { offer: Offer }) {
  const discount = Math.round(offer.discountPercentage);

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-primary/40">
      <div className="mb-3 flex items-start justify-between gap-2 text-left">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {offer.business?.businessType}
          </p>
          <h3 className="mt-0.5 text-lg font-bold text-slate-900 dark:text-zinc-100">{offer.title}</h3>
          <p className="text-sm text-slate-500 dark:text-zinc-400">{offer.business?.name}</p>
        </div>
        <CountdownTimer endDate={offer.endDate} />
      </div>
      <div className="mb-3 flex flex-wrap items-baseline gap-2 text-left">
        <span className="text-sm text-slate-400 line-through dark:text-zinc-500">
          ₹{offer.originalPrice}
        </span>
        <span className="text-2xl font-bold text-primary">₹{offer.offerPrice}</span>
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-400">
          {discount}% off
        </span>
      </div>
      <p className="mb-4 text-left text-sm text-slate-600 dark:text-zinc-400">
        {offer.availableSlotsCount ?? 0} slots available · {offer.category}
      </p>
      <Link
        to={`/offers/${offer.id}`}
        className="mt-auto rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
      >
        Book Now
      </Link>
    </article>
  );
}
