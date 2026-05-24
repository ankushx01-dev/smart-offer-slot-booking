import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getOfferCategoriesForType } from '../../constants/businessTypes';
import { businessApi, offersApi } from '../../services/api';
import { getApiErrorMessage } from '../../utils/apiErrors';

export default function EditOfferPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [businessType, setBusinessType] = useState('Gym');
  const [offerForm, setOfferForm] = useState({
    title: '',
    description: '',
    category: 'Trial',
    originalPrice: 499,
    offerPrice: 99,
    startDate: '',
    endDate: '',
    termsAndConditions: '',
    status: 'Active',
    maxBookingPerCustomer: 1,
  });

  const categoryOptions = useMemo(() => getOfferCategoriesForType(businessType), [businessType]);

  useEffect(() => {
    if (!id) return;
    Promise.all([businessApi.getMine().catch(() => null), offersApi.getById(Number(id))])
      .then(([biz, offerRes]) => {
        if (biz?.data?.businessType) setBusinessType(biz.data.businessType);
        const o = offerRes.data;
        setOfferForm({
          title: o.title,
          description: o.description,
          category: o.category,
          originalPrice: o.originalPrice,
          offerPrice: o.offerPrice,
          startDate: o.startDate,
          endDate: o.endDate,
          termsAndConditions: o.termsAndConditions ?? '',
          status: o.status,
          maxBookingPerCustomer: o.maxBookingPerCustomer,
        });
      })
      .catch(() => setError('Could not load offer'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError('');
    if (offerForm.offerPrice >= offerForm.originalPrice) {
      setError('Offer price must be less than original price');
      return;
    }
    try {
      await offersApi.update(Number(id), {
        ...offerForm,
        originalPrice: Number(offerForm.originalPrice),
        offerPrice: Number(offerForm.offerPrice),
        maxBookingPerCustomer: Number(offerForm.maxBookingPerCustomer),
      });
      navigate('/admin/offers');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to update offer'));
    }
  };

  if (loading) {
    return <p className="text-slate-500 dark:text-zinc-400">Loading offer...</p>;
  }

  return (
    <div className="text-left">
      <Link to="/admin/offers" className="mb-4 inline-block text-sm text-primary hover:underline">
        ← Back to offers
      </Link>
      <h2 className="ui-page-title mb-6">Edit Offer</h2>
      {error && <p className="mb-4 text-red-600 dark:text-red-400">{error}</p>}
      <form onSubmit={handleSubmit} className="ui-card max-w-3xl space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="ui-label sm:col-span-2">
            Offer Title
            <input
              required
              value={offerForm.title}
              onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
              className="ui-input mt-1"
            />
          </label>
          <label className="ui-label sm:col-span-2">
            Description
            <textarea
              required
              rows={3}
              value={offerForm.description}
              onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
              className="ui-input mt-1"
            />
          </label>
          <label className="ui-label">
            Category
            <select
              value={offerForm.category}
              onChange={(e) => setOfferForm({ ...offerForm, category: e.target.value })}
              className="ui-input mt-1"
            >
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="ui-label">
            Status
            <select
              value={offerForm.status}
              onChange={(e) => setOfferForm({ ...offerForm, status: e.target.value })}
              className="ui-input mt-1"
            >
              {['Draft', 'Active', 'Paused', 'Expired', 'Cancelled'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="ui-label">
            Original Price (₹)
            <input
              type="number"
              required
              value={offerForm.originalPrice}
              onChange={(e) => setOfferForm({ ...offerForm, originalPrice: Number(e.target.value) })}
              className="ui-input mt-1"
            />
          </label>
          <label className="ui-label">
            Offer Price (₹)
            <input
              type="number"
              required
              value={offerForm.offerPrice}
              onChange={(e) => setOfferForm({ ...offerForm, offerPrice: Number(e.target.value) })}
              className="ui-input mt-1"
            />
          </label>
          <label className="ui-label">
            Start Date
            <input
              type="date"
              required
              value={offerForm.startDate}
              onChange={(e) => setOfferForm({ ...offerForm, startDate: e.target.value })}
              className="ui-input mt-1"
            />
          </label>
          <label className="ui-label">
            End Date
            <input
              type="date"
              required
              value={offerForm.endDate}
              onChange={(e) => setOfferForm({ ...offerForm, endDate: e.target.value })}
              className="ui-input mt-1"
            />
          </label>
          <label className="ui-label">
            Max Booking Per Customer
            <input
              type="number"
              min={1}
              value={offerForm.maxBookingPerCustomer}
              onChange={(e) =>
                setOfferForm({ ...offerForm, maxBookingPerCustomer: Number(e.target.value) })
              }
              className="ui-input mt-1"
            />
          </label>
          <label className="ui-label sm:col-span-2">
            Terms & Conditions
            <textarea
              rows={2}
              value={offerForm.termsAndConditions}
              onChange={(e) => setOfferForm({ ...offerForm, termsAndConditions: e.target.value })}
              className="ui-input mt-1"
            />
          </label>
        </div>
        <button type="submit" className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-blue-700">
          Save Changes
        </button>
      </form>
    </div>
  );
}
