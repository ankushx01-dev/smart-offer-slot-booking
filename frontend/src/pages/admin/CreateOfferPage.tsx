import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOfferCategoriesForType } from '../../constants/businessTypes';
import { businessApi, offersApi, slotsApi } from '../../services/api';
import { getApiErrorMessage } from '../../utils/apiErrors';

export default function CreateOfferPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [businessType, setBusinessType] = useState('Gym');
  const [offerForm, setOfferForm] = useState({
    title: '',
    description: '',
    category: 'Trial',
    originalPrice: 499,
    offerPrice: 99,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    termsAndConditions: '',
    status: 'Active',
    maxBookingPerCustomer: 1,
  });
  const [slotForm, setSlotForm] = useState({
    slotDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    startTime: '10:00',
    endTime: '11:00',
    capacity: 10,
  });

  const categoryOptions = useMemo(() => getOfferCategoriesForType(businessType), [businessType]);

  useEffect(() => {
    businessApi
      .getMine()
      .then((res) => {
        if (res.data?.businessType) {
          setBusinessType(res.data.businessType);
          const categories = getOfferCategoriesForType(res.data.businessType);
          setOfferForm((prev) => ({
            ...prev,
            category: categories.includes(prev.category) ? prev.category : categories[0],
          }));
        }
      })
      .catch(() => undefined);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (offerForm.offerPrice >= offerForm.originalPrice) {
      setError('Offer price must be less than original price');
      return;
    }
    try {
      const { data: offer } = await offersApi.create({
        ...offerForm,
        originalPrice: Number(offerForm.originalPrice),
        offerPrice: Number(offerForm.offerPrice),
        maxBookingPerCustomer: Number(offerForm.maxBookingPerCustomer),
      });
      await slotsApi.create({
        offerId: offer.id,
        slotDate: slotForm.slotDate,
        startTime: slotForm.startTime,
        endTime: slotForm.endTime,
        capacity: Number(slotForm.capacity),
      });
      navigate('/admin/offers');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to create offer. Complete Business profile first.'));
    }
  };

  return (
    <div className="text-left">
      <h2 className="ui-page-title mb-6">Create Offer</h2>
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
            Category ({businessType})
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
        <hr />
        <h3 className="font-semibold">First Slot</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="ui-label">
            Slot Date
            <input
              type="date"
              required
              value={slotForm.slotDate}
              onChange={(e) => setSlotForm({ ...slotForm, slotDate: e.target.value })}
              className="ui-input mt-1"
            />
          </label>
          <label className="ui-label">
            Capacity
            <input
              type="number"
              min={1}
              required
              value={slotForm.capacity}
              onChange={(e) => setSlotForm({ ...slotForm, capacity: Number(e.target.value) })}
              className="ui-input mt-1"
            />
          </label>
          <label className="ui-label">
            Start Time
            <input
              type="time"
              required
              value={slotForm.startTime}
              onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
              className="ui-input mt-1"
            />
          </label>
          <label className="ui-label">
            End Time
            <input
              type="time"
              required
              value={slotForm.endTime}
              onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
              className="ui-input mt-1"
            />
          </label>
        </div>
        <button type="submit" className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-blue-700">
          Create Offer & Slot
        </button>
      </form>
    </div>
  );
}
