import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { offersApi, slotsApi } from '../../services/api';
import type { Offer } from '../../types';
import { getApiErrorMessage } from '../../utils/apiErrors';

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-green-100 text-green-800',
  Draft: 'bg-slate-100 text-slate-700',
  Paused: 'bg-amber-100 text-amber-800',
  Expired: 'bg-slate-200 text-slate-600',
  Cancelled: 'bg-red-100 text-red-800',
};

export default function ManageOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [slotOfferId, setSlotOfferId] = useState<number | null>(null);
  const [slotForm, setSlotForm] = useState({
    slotDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    startTime: '10:00',
    endTime: '11:00',
    capacity: 10,
  });

  const load = () => {
    setLoading(true);
    offersApi
      .getAdmin()
      .then((res) => setOffers(res.data))
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load offers')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await offersApi.update(id, { status });
      load();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Could not update offer status'));
    }
  };

  const addSlot = async (offerId: number) => {
    try {
      await slotsApi.create({
        offerId,
        slotDate: slotForm.slotDate,
        startTime: slotForm.startTime,
        endTime: slotForm.endTime,
        capacity: Number(slotForm.capacity),
      });
      setSlotOfferId(null);
      load();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Could not add slot'));
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this offer?')) return;
    try {
      await offersApi.delete(id);
      load();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Could not delete offer'));
    }
  };

  if (loading) {
    return <p className="text-slate-500 dark:text-zinc-400">Loading offers...</p>;
  }

  return (
    <div className="text-left">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="ui-page-title">Manage Offers</h2>
        <Link
          to="/admin/offers/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Create Offer
        </Link>
      </div>

      {error && <p className="mb-4 text-red-600 dark:text-red-400">{error}</p>}

      {!offers.length ? (
        <div className="ui-card border-dashed p-12 text-center">
          <p className="text-slate-600 dark:text-zinc-300">No offers yet.</p>
          <Link to="/admin/offers/new" className="mt-3 inline-block text-primary hover:underline">
            Create your first offer
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {offers.map((o) => (
              <article key={o.id} className="ui-card flex flex-col p-5">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase text-primary">{o.category}</p>
                    <h3 className="font-semibold text-slate-900 dark:text-zinc-50">{o.title}</h3>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      STATUS_STYLES[o.status] ?? 'bg-slate-100'
                    }`}
                  >
                    {o.status}
                  </span>
                </div>
                <p className="mb-3 line-clamp-2 text-sm text-slate-500 dark:text-zinc-400">
                  {o.description}
                </p>
                <p className="mb-1 text-sm">
                  <span className="text-slate-400 line-through dark:text-zinc-500">
                    ₹{o.originalPrice}
                  </span>{' '}
                  <span className="font-bold text-primary">₹{o.offerPrice}</span>
                </p>
                <p className="mb-4 text-xs text-slate-400 dark:text-zinc-500">
                  {o.startDate} → {o.endDate} · {o.availableSlotsCount ?? 0} slots open
                </p>
                <div className="mt-auto flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-zinc-800">
                  <Link
                    to={`/admin/offers/${o.id}/edit`}
                    className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSlotOfferId(slotOfferId === o.id ? null : o.id)}
                    className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100"
                  >
                    {slotOfferId === o.id ? 'Cancel slot' : 'Add slot'}
                  </button>
                  {o.status !== 'Active' && (
                    <button
                      type="button"
                      onClick={() => updateStatus(o.id, 'Active')}
                      className="rounded bg-green-50 px-2 py-1 text-xs text-green-700 hover:bg-green-100"
                    >
                      Activate
                    </button>
                  )}
                  {o.status === 'Active' && (
                    <button
                      type="button"
                      onClick={() => updateStatus(o.id, 'Paused')}
                      className="rounded bg-amber-50 px-2 py-1 text-xs text-amber-700 hover:bg-amber-100"
                    >
                      Pause
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => updateStatus(o.id, 'Cancelled')}
                    className="rounded bg-slate-50 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(o.id)}
                    className="rounded bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
                {slotOfferId === o.id && (
                  <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 dark:border-zinc-800 sm:grid-cols-2">
                    <input
                      type="date"
                      value={slotForm.slotDate}
                      onChange={(e) => setSlotForm({ ...slotForm, slotDate: e.target.value })}
                      className="ui-input"
                    />
                    <input
                      type="number"
                      min={1}
                      value={slotForm.capacity}
                      onChange={(e) => setSlotForm({ ...slotForm, capacity: Number(e.target.value) })}
                      className="ui-input"
                      placeholder="Capacity"
                    />
                    <input
                      type="time"
                      value={slotForm.startTime}
                      onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                      className="ui-input"
                    />
                    <input
                      type="time"
                      value={slotForm.endTime}
                      onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                      className="ui-input"
                    />
                    <button
                      type="button"
                      onClick={() => addSlot(o.id)}
                      className="rounded bg-primary px-3 py-1.5 text-sm text-white sm:col-span-2"
                    >
                      Save slot
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>

          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead className="ui-table-head">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Dates</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((o) => (
                  <tr key={o.id} className="ui-table-row">
                    <td className="p-3 font-medium text-slate-900 dark:text-zinc-100">{o.title}</td>
                    <td className="p-3">
                      ₹{o.offerPrice}{' '}
                      <span className="text-slate-400 line-through dark:text-zinc-500">
                        ₹{o.originalPrice}
                      </span>
                    </td>
                    <td className="p-3">{o.startDate} → {o.endDate}</td>
                    <td className="p-3">{o.status}</td>
                    <td className="space-x-2 p-3">
                      {o.status === 'Active' && (
                        <button
                          type="button"
                          onClick={() => updateStatus(o.id, 'Paused')}
                          className="text-amber-600 hover:underline dark:text-amber-400"
                        >
                          Pause
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => updateStatus(o.id, 'Cancelled')}
                        className="text-slate-600 hover:underline dark:text-zinc-400"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
