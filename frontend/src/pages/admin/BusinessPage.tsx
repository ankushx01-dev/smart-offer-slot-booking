import { FormEvent, useEffect, useState } from 'react';
import { businessApi, type BusinessProfilePayload } from '../../services/api';
import { BUSINESS_TYPES } from '../../constants/businessTypes';
import { useAuthStore } from '../../store/authStore';
import type { Business } from '../../types';
import { getApiErrorMessage } from '../../utils/apiErrors';

function toPayload(form: typeof emptyForm): BusinessProfilePayload {
  return {
    name: form.name.trim(),
    businessType: form.businessType,
    ownerName: form.ownerName.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
    address: form.address.trim(),
    city: form.city.trim(),
    logoUrl: form.logoUrl.trim() || undefined,
    openingTime: form.openingTime,
    closingTime: form.closingTime,
  };
}

const emptyForm = {
  name: '',
  businessType: 'Gym' as string,
  ownerName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  logoUrl: '',
  openingTime: '09:00',
  closingTime: '21:00',
};

const inputClass = 'ui-input mt-2';
const labelClass = 'ui-label text-left';

export default function BusinessPage() {
  const { token, name, email, setAuth } = useAuthStore();
  const [business, setBusiness] = useState<Business | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    businessApi
      .getMine()
      .then((res) => {
        if (res.data?.id) {
          setBusiness(res.data);
          setForm({
            name: res.data.name,
            businessType: res.data.businessType,
            ownerName: res.data.ownerName,
            phone: res.data.phone,
            email: res.data.email,
            address: res.data.address,
            city: res.data.city,
            logoUrl: res.data.logoUrl || '',
            openingTime: res.data.openingTime?.slice(0, 5) ?? '09:00',
            closingTime: res.data.closingTime?.slice(0, 5) ?? '21:00',
          });
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setSaving(true);

    try {
      const payload = toPayload(form);
      const { data } = business?.id
        ? await businessApi.update(business.id, payload)
        : await businessApi.upsertMine(payload);
      setBusiness(data);
      if (token && name && email) {
        setAuth(token, name, email, data.businessType, data.name);
      }
      setMessage(business?.id ? 'Business profile updated' : 'Business profile created');
    } catch (err: unknown) {
      setMessage(getApiErrorMessage(err, 'Failed to save business profile'));
      setIsError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="text-left">
      <h2 className="ui-page-title">Business Profile</h2>
      {message && (
        <p className={`mt-4 text-sm ${isError ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
          {message}
        </p>
      )}
      {loading ? (
        <p className="mt-6 text-slate-500 dark:text-zinc-400">Loading profile...</p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="ui-card mt-6 max-w-2xl space-y-5 p-6 sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>
              Business Name
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Business Type
              <select
                value={form.businessType}
                onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                className={inputClass}
              >
                {BUSINESS_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Owner Name
              <input
                required
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Phone
              <input
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              Email
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              Address
              <input
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              City
              <input
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Logo URL (optional)
              <input
                value={form.logoUrl}
                onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Opening Time
              <input
                type="time"
                required
                value={form.openingTime}
                onChange={(e) => setForm({ ...form, openingTime: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Closing Time
              <input
                type="time"
                required
                value={form.closingTime}
                onChange={(e) => setForm({ ...form, closingTime: e.target.value })}
                className={inputClass}
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      )}
    </div>
  );
}
