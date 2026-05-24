import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BUSINESS_TYPES, getOfferCategoriesForType, type BusinessType } from '../../constants/businessTypes';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { getApiErrorMessage } from '../../utils/apiErrors';
import { normalizeLoginResponse } from '../../utils/authHelpers';

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const storedBusinessType = useAuthStore((s) => s.businessType);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (storedBusinessType) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [storedBusinessType, navigate]);

  const [account, setAccount] = useState({ name: '', email: '', password: '', confirm: '' });

  const [businessType, setBusinessType] = useState<BusinessType>('Gym');
  const [business, setBusiness] = useState({
    name: '',
    ownerName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Mumbai',
    openingTime: '09:00',
    closingTime: '21:00',
  });

  const [offer, setOffer] = useState({
    title: '',
    description: '',
    category: 'Trial',
    originalPrice: 499,
    offerPrice: 99,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    slotDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    slotStartTime: '10:00',
    slotEndTime: '11:00',
    capacity: 10,
  });

  const categoryOptions = getOfferCategoriesForType(businessType);

  const handleAccountSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (account.password !== account.confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.register(account.name, account.email, account.password);
      const login = normalizeLoginResponse(data);
      setAuth(login.token, login.name, login.email, login.businessType, login.businessName);
      setBusiness((b) => ({ ...b, ownerName: data.name, email: data.email }));
      setStep(2);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!business.name.trim()) {
      setError('Business name is required');
      return;
    }
    if (!business.ownerName.trim() || !business.phone.trim() || !business.address.trim()) {
      setError('Please fill in owner name, phone, and address');
      return;
    }
    if (!offer.title.trim() || !offer.description.trim()) {
      setError('Offer title and description are required');
      return;
    }
    if (offer.offerPrice >= offer.originalPrice) {
      setError('Offer price must be less than the original price');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.completeOnboarding({
        name: business.name,
        businessType,
        ownerName: business.ownerName,
        phone: business.phone,
        email: business.email || account.email,
        address: business.address,
        city: business.city,
        openingTime: business.openingTime,
        closingTime: business.closingTime,
        offerTitle: offer.title,
        offerDescription: offer.description,
        category: offer.category,
        originalPrice: Number(offer.originalPrice),
        offerPrice: Number(offer.offerPrice),
        startDate: offer.startDate,
        endDate: offer.endDate,
        slotDate: offer.slotDate,
        slotStartTime: offer.slotStartTime,
        slotEndTime: offer.slotEndTime,
        capacity: Number(offer.capacity),
      });
      const login = normalizeLoginResponse(data);
      setAuth(
        login.token,
        login.name,
        login.email,
        login.businessType ?? businessType,
        login.businessName ?? business.name
      );
      navigate('/admin/dashboard', { replace: true });
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Setup failed. Check your details and try again.'));
    } finally {
      setLoading(false);
    }
  };

  const selectType = (type: BusinessType) => {
    setBusinessType(type);
    const categories = getOfferCategoriesForType(type);
    setOffer((o) => ({ ...o, category: categories[0] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-4 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-center text-2xl font-bold text-primary">Create New Account</h1>
        <p className="mb-4 text-center text-sm text-slate-600">
          {step === 1
            ? 'Step 1 of 2 — Only for new businesses (not for existing gym admin login)'
            : 'Step 2 of 2 — Business & first offer'}
        </p>
        <p className="mb-6 text-center text-sm">
          <Link to="/admin/login" className="text-primary hover:underline">
            Already have an account? Sign in to your dashboard
          </Link>
        </p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">{error}</p>
        )}

        {step === 1 && (
          <form onSubmit={handleAccountSubmit} className="ui-card p-8 shadow-lg">
            <label className="mb-4 block text-sm font-medium">
              Your name
              <input
                required
                value={account.name}
                onChange={(e) => setAccount({ ...account, name: e.target.value })}
                className="ui-input mt-1"
              />
            </label>
            <label className="mb-4 block text-sm font-medium">
              Email
              <input
                type="email"
                required
                value={account.email}
                onChange={(e) => setAccount({ ...account, email: e.target.value })}
                className="ui-input mt-1"
              />
            </label>
            <label className="mb-4 block text-sm font-medium">
              Password
              <input
                type="password"
                required
                minLength={6}
                value={account.password}
                onChange={(e) => setAccount({ ...account, password: e.target.value })}
                className="ui-input mt-1"
              />
            </label>
            <label className="mb-6 block text-sm font-medium">
              Confirm password
              <input
                type="password"
                required
                value={account.confirm}
                onChange={(e) => setAccount({ ...account, confirm: e.target.value })}
                className="ui-input mt-1"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-2.5 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Continue'}
            </button>
            <p className="mt-4 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/admin/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOnboardingSubmit} className="ui-card space-y-6 p-8 shadow-lg">
            <div>
              <p className="mb-3 text-sm font-medium text-slate-700">Business category</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {BUSINESS_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => selectType(type)}
                    className={`rounded-lg border-2 p-3 text-center text-sm ${
                      businessType === type ? 'border-primary bg-blue-50' : 'border-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium sm:col-span-2">
                Business name
                <input
                  required
                  value={business.name}
                  onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                  className="ui-input mt-1"
                />
              </label>
              <label className="text-sm font-medium">
                Owner name
                <input
                  required
                  value={business.ownerName}
                  onChange={(e) => setBusiness({ ...business, ownerName: e.target.value })}
                  className="ui-input mt-1"
                />
              </label>
              <label className="text-sm font-medium">
                Phone
                <input
                  required
                  value={business.phone}
                  onChange={(e) => setBusiness({ ...business, phone: e.target.value })}
                  className="ui-input mt-1"
                />
              </label>
              <label className="text-sm font-medium sm:col-span-2">
                Address
                <input
                  required
                  value={business.address}
                  onChange={(e) => setBusiness({ ...business, address: e.target.value })}
                  className="ui-input mt-1"
                />
              </label>
              <label className="text-sm font-medium">
                City
                <input
                  required
                  value={business.city}
                  onChange={(e) => setBusiness({ ...business, city: e.target.value })}
                  className="ui-input mt-1"
                />
              </label>
              <label className="text-sm font-medium">
                Opening time
                <input
                  type="time"
                  required
                  value={business.openingTime}
                  onChange={(e) => setBusiness({ ...business, openingTime: e.target.value })}
                  className="ui-input mt-1"
                />
              </label>
              <label className="text-sm font-medium">
                Closing time
                <input
                  type="time"
                  required
                  value={business.closingTime}
                  onChange={(e) => setBusiness({ ...business, closingTime: e.target.value })}
                  className="ui-input mt-1"
                />
              </label>
            </div>

            <hr />
            <h3 className="font-semibold text-slate-800">Your first offer</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium sm:col-span-2">
                Offer title
                <input
                  required
                  value={offer.title}
                  onChange={(e) => setOffer({ ...offer, title: e.target.value })}
                  className="ui-input mt-1"
                />
              </label>
              <label className="text-sm font-medium sm:col-span-2">
                Description
                <textarea
                  required
                  rows={2}
                  value={offer.description}
                  onChange={(e) => setOffer({ ...offer, description: e.target.value })}
                  className="ui-input mt-1"
                />
              </label>
              <label className="text-sm font-medium">
                Offer category
                <select
                  value={offer.category}
                  onChange={(e) => setOffer({ ...offer, category: e.target.value })}
                  className="ui-input mt-1"
                >
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Original price (₹)
                <input
                  type="number"
                  required
                  min={1}
                  value={offer.originalPrice}
                  onChange={(e) => setOffer({ ...offer, originalPrice: Number(e.target.value) })}
                  className="ui-input mt-1"
                />
              </label>
              <label className="text-sm font-medium">
                Offer price (₹)
                <input
                  type="number"
                  required
                  min={1}
                  value={offer.offerPrice}
                  onChange={(e) => setOffer({ ...offer, offerPrice: Number(e.target.value) })}
                  className="ui-input mt-1"
                />
              </label>
              <label className="text-sm font-medium">
                Start date
                <input
                  type="date"
                  required
                  value={offer.startDate}
                  onChange={(e) => setOffer({ ...offer, startDate: e.target.value })}
                  className="ui-input mt-1"
                />
              </label>
              <label className="text-sm font-medium">
                End date
                <input
                  type="date"
                  required
                  value={offer.endDate}
                  onChange={(e) => setOffer({ ...offer, endDate: e.target.value })}
                  className="ui-input mt-1"
                />
              </label>
              <label className="text-sm font-medium">
                First slot date
                <input
                  type="date"
                  required
                  value={offer.slotDate}
                  onChange={(e) => setOffer({ ...offer, slotDate: e.target.value })}
                  className="ui-input mt-1"
                />
              </label>
              <label className="text-sm font-medium">
                Slot capacity
                <input
                  type="number"
                  required
                  min={1}
                  value={offer.capacity}
                  onChange={(e) => setOffer({ ...offer, capacity: Number(e.target.value) })}
                  className="ui-input mt-1"
                />
              </label>
              <label className="text-sm font-medium">
                Slot start
                <input
                  type="time"
                  required
                  value={offer.slotStartTime}
                  onChange={(e) => setOffer({ ...offer, slotStartTime: e.target.value })}
                  className="ui-input mt-1"
                />
              </label>
              <label className="text-sm font-medium">
                Slot end
                <input
                  type="time"
                  required
                  value={offer.slotEndTime}
                  onChange={(e) => setOffer({ ...offer, slotEndTime: e.target.value })}
                  className="ui-input mt-1"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Setting up...' : 'Finish & go to dashboard'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
