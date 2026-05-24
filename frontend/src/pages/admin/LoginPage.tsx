import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';
import { authApi, businessApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { getApiErrorMessage } from '../../utils/apiErrors';
import { normalizeLoginResponse } from '../../utils/authHelpers';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await authApi.login(email, password);
      const login = normalizeLoginResponse(data);

      let businessType = login.businessType;
      let businessName = login.businessName;

      if (!businessType) {
        try {
          const mine = await businessApi.getMine();
          businessType = mine.data.businessType;
          businessName = mine.data.name;
        } catch {
          // No business yet — user stays in panel with setup hint (not forced to register)
        }
      }

      setAuth(login.token, login.name, login.email, businessType, businessName);
      navigate('/admin/dashboard', { replace: true });
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Invalid email or password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 p-4 font-sans dark:from-zinc-950 dark:to-zinc-900">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <form onSubmit={handleSubmit} className="ui-card w-full max-w-md p-8 shadow-lg">
        <h1 className="mb-1 text-2xl font-bold text-primary">Admin Login</h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-zinc-400">
          Sign in to open your Gym (or other) admin dashboard
        </p>
        {error && (
          <p className="mb-4 rounded bg-red-50 p-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
            {error}
          </p>
        )}
        <label className="ui-label mb-4">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="ui-input mt-1"
            placeholder="admin@gmail.com"
          />
        </label>
        <label className="ui-label mb-6">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="ui-input mt-1"
            placeholder="Enter your password"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Open Admin Panel'}
        </button>
        <p className="mt-6 text-center text-sm text-slate-600 dark:text-zinc-400">
          Don&apos;t have an account?{' '}
          <Link to="/admin/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-slate-400 dark:text-zinc-500">
          Gym demo: admin@gmail.com or admin@smartoffer.com / Admin@123
        </p>
        <Link to="/" className="mt-4 block text-center text-sm text-primary hover:underline">
          View public offers
        </Link>
      </form>
    </div>
  );
}
