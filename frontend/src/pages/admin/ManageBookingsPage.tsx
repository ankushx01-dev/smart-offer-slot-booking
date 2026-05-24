import { useEffect, useState } from 'react';
import { bookingsApi } from '../../services/api';
import type { Booking } from '../../types';
import { exportBookingsCsv } from '../../utils/exportCsv';

const STATUSES = ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'NoShow'];

export default function ManageBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const load = () => {
    bookingsApi.getAll().then((res) => setBookings(res.data));
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await bookingsApi.updateStatus(id, status);
      load();
    } catch {
      alert('Could not update booking status. Please try again.');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="ui-page-title">Manage Bookings</h2>
        <button
          type="button"
          disabled={!bookings.length}
          onClick={() => exportBookingsCsv(bookings)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Export CSV
        </button>
      </div>
      <div className="ui-table-wrap">
        <table className="ui-table">
          <thead className="ui-table-head">
            <tr>
              <th className="p-3">Reference</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Offer</th>
              <th className="p-3">Slot</th>
              <th className="p-3">People</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="ui-table-row">
                <td className="p-3 font-mono text-xs">{b.bookingReference}</td>
                <td className="p-3">
                  <div className="text-slate-900 dark:text-zinc-100">{b.customerName}</div>
                  <div className="text-slate-500 dark:text-zinc-400">{b.customerPhone}</div>
                </td>
                <td className="p-3">{b.offerTitle ?? b.offer?.title}</td>
                <td className="p-3">
                  {b.slot?.slotDate} {b.slot?.startTime}-{b.slot?.endTime}
                </td>
                <td className="p-3">{b.peopleCount}</td>
                <td className="p-3">{b.status}</td>
                <td className="p-3">
                  <select
                    value={b.status}
                    onChange={(e) => updateStatus(b.id, e.target.value)}
                    className="ui-input max-w-[8rem] py-1 text-xs"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s === 'NoShow' ? 'No Show' : s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {!bookings.length && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400 dark:text-zinc-500">
                  No bookings yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
