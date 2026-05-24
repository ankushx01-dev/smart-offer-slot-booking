import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingsApi, dashboardApi } from '../../services/api';
import type { Booking, DashboardSummary } from '../../types';
import { getApiErrorMessage } from '../../utils/apiErrors';

const STATUSES = ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'NoShow'];

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState('');

  const load = () => {
    dashboardApi
      .getSummary()
      .then((res) => setSummary(res.data))
      .catch(() => setError('Could not load dashboard. Ensure backend is running.'));
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await bookingsApi.updateStatus(id, status);
      load();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Could not update status'));
    }
  };

  const stats = [
    { label: 'Total Offers', value: summary?.totalOffers ?? 0 },
    { label: 'Active Offers', value: summary?.activeOffers ?? 0 },
    { label: 'Total Bookings', value: summary?.totalBookings ?? 0 },
    { label: "Today's Bookings", value: summary?.todaysBookings ?? 0 },
    { label: 'Total Capacity', value: summary?.totalCapacity ?? 0 },
    { label: 'Booked Seats', value: summary?.bookedSeats ?? 0 },
    { label: 'Available Seats', value: summary?.availableSeats ?? 0 },
    { label: 'Conversion Rate', value: `${summary?.conversionRate ?? 0}%` },
  ];

  return (
    <div className="text-left">
      <h2 className="ui-page-title mb-6">Dashboard</h2>
      {error && <p className="mb-4 text-red-600 dark:text-red-400">{error}</p>}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="ui-card p-4">
            <p className="text-sm text-slate-500 dark:text-zinc-400">{s.label}</p>
            <p className="text-2xl font-bold text-primary">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="ui-table-wrap">
        <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-zinc-800">
          <h3 className="font-semibold text-slate-900 dark:text-zinc-100">Recent Bookings</h3>
          <Link to="/admin/bookings" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="ui-table">
            <thead className="ui-table-head">
              <tr>
                <th className="p-3">Customer</th>
                <th className="p-3">Offer</th>
                <th className="p-3">Slot</th>
                <th className="p-3">People</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {(summary?.recentBookings ?? []).map((b: Booking) => (
                <tr key={b.id} className="ui-table-row">
                  <td className="p-3">{b.customerName}</td>
                  <td className="p-3">{b.offerTitle ?? b.offer?.title}</td>
                  <td className="p-3">
                    {b.slot?.slotDate} {b.slot?.startTime}-{b.slot?.endTime}
                  </td>
                  <td className="p-3">{b.peopleCount}</td>
                  <td className="p-3">
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                      {b.status}
                    </span>
                  </td>
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
              {!summary?.recentBookings?.length && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    No bookings yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
