import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { businessApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import ThemeToggle from './ThemeToggle';

const nav = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/business', label: 'Business' },
  { to: '/admin/offers', label: 'Offers' },
  { to: '/admin/offers/new', label: 'Create Offer' },
  { to: '/admin/bookings', label: 'Bookings' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const businessType = useAuthStore((s) => s.businessType);
  const businessName = useAuthStore((s) => s.businessName);
  const { token, name, email, setAuth, logout } = useAuthStore();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(!!businessType);

  useEffect(() => {
    if (!token) {
      setCheckingProfile(false);
      setProfileLoaded(false);
      return;
    }

    if (businessType) {
      setProfileLoaded(true);
      setCheckingProfile(false);
      return;
    }

    businessApi
      .getMine()
      .then((res) => {
        if (res.data?.businessType) {
          setAuth(token, name ?? '', email ?? '', res.data.businessType, res.data.name);
          setProfileLoaded(true);
        } else {
          setProfileLoaded(false);
        }
      })
      .catch(() => setProfileLoaded(false))
      .finally(() => setCheckingProfile(false));
  }, [token, businessType, name, email, setAuth]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (checkingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 font-sans text-slate-600 dark:bg-zinc-950 dark:text-zinc-400">
        Loading admin panel...
      </div>
    );
  }

  const activeType = useAuthStore.getState().businessType;
  const activeName = useAuthStore.getState().businessName;

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 dark:bg-zinc-950 dark:text-zinc-200 md:flex">
      <aside className="w-full border-b border-slate-200 bg-slate-50 md:w-72 md:shrink-0 md:border-b-0 md:border-r dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-slate-200 px-5 py-5 dark:border-zinc-800">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-zinc-500">
            Admin Panel
          </p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-primary">Smart Offer</h1>
          {activeType ? (
            <p className="mt-2 text-left text-xs font-medium leading-snug text-slate-600 dark:text-zinc-400">
              {activeType} Admin · {activeName}
            </p>
          ) : (
            <p className="mt-2 text-left text-xs text-slate-500 dark:text-zinc-500">
              Signed in as {name}
            </p>
          )}
        </div>
        <nav className="flex gap-1 overflow-x-auto p-3 md:flex-col md:overflow-visible md:p-4">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin/offers'}
              className={({ isActive }) =>
                `block min-w-[9rem] rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition md:min-w-0 ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-800 hover:bg-slate-200/80 dark:text-zinc-200 dark:hover:bg-zinc-800'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Link
            to="/"
            className="block min-w-[9rem] rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-200/80 dark:text-zinc-300 dark:hover:bg-zinc-800 md:min-w-0"
          >
            Public Site
          </Link>
        </nav>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-end gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900 md:px-8">
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Logout
          </button>
        </div>
        <div className="flex-1 p-4 md:p-8">
          {!profileLoaded && !activeType ? (
            <div className="mb-6 max-w-lg rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/40">
              <p className="text-left text-sm text-amber-900 dark:text-amber-200">
                Complete your{' '}
                <Link to="/admin/business" className="font-semibold underline">
                  business profile
                </Link>{' '}
                to create offers. Demo login: admin@gmail.com / Admin@123
              </p>
            </div>
          ) : null}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
