import { useEffect, useState } from 'react';
import api, { getIndianLocations } from '../services/api';
import { getCurrentUser, getToken } from '../utils/auth';

const specializations = [
  'Crop Disease Specialist',
  'Soil Specialist',
  'Horticulture Expert',
  'Irrigation Specialist',
  'Organic Farming Expert',
  'Pest Management Expert',
  'Agricultural Consultant',
];

const defaultForm = {
  phone: '',
  specialization: '',
  experience: '',
  qualification: '',
  state: '',
  district: '',
  serviceRadius: '',
  bio: '',
};

function ExpertProfilePage() {
  const [user, setUser] = useState(() => {
    const storedUser = getCurrentUser();
    return {
      name: storedUser?.name || '',
      email: storedUser?.email || '',
    };
  });
  const [form, setForm] = useState(defaultForm);
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [locations, setLocations] = useState({ states: [], districtsByState: {} });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadProfile() {
    const token = getToken();
    if (!token) {
      throw new Error('Your session has expired. Please log in again.');
    }
    const response = await api.get('/experts/profile', { headers: { Authorization: `Bearer ${token}` } });
    const data = response?.data?.data || {};
    const profile = data.profile || {};
    const storedUser = getCurrentUser();
    setUser({
      name: data.user?.name || storedUser?.name || '',
      email: data.user?.email || storedUser?.email || '',
    });
    setForm({
      ...defaultForm,
      ...Object.fromEntries(Object.keys(defaultForm).map((key) => [key, profile[key] ?? ''])),
    });
    setVerificationStatus(profile.verificationStatus || 'pending');
  }

  useEffect(() => {
    async function fetchPageData() {
      const profileRequest = loadProfile().catch((err) => {
        setError(err?.response?.data?.message || err.message || 'Unable to load your expert profile.');
      });
      const locationRequest = getIndianLocations()
        .then((locationResponse) => {
          const locationData = locationResponse?.data;
          if (!locationData?.states?.length || !locationData?.districtsByState) {
            throw new Error('Location data is unavailable.');
          }
          setLocations(locationData);
        })
        .catch((err) => {
          setError((current) => current || (err?.response?.data?.message || 'Unable to load states. Please check the backend connection.'));
        });

      try {
        await Promise.all([profileRequest, locationRequest]);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load the expert profile.');
      } finally {
        setLoading(false);
      }
    }

    fetchPageData();
  }, []);

  const districts = locations.districtsByState[form.state] || [];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSuccess('');
    if (name === 'state') {
      setForm((prev) => ({ ...prev, state: value, district: '' }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = getToken();
      await api.put('/experts/profile', form, { headers: { Authorization: `Bearer ${token}` } });
      await loadProfile();
      setSuccess('Expert profile updated successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to save expert profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">Loading profile...</div>;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expert Profile</h1>
          <p className="mt-1 text-sm text-slate-600">Complete your professional details for admin review.</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
          verificationStatus === 'verified'
            ? 'bg-green-100 text-green-700'
            : verificationStatus === 'rejected'
              ? 'bg-red-100 text-red-700'
              : 'bg-amber-100 text-amber-700'
        }`}>{verificationStatus}</span>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="fullName">Full Name</label>
          <input id="fullName" value={user.name} readOnly className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">Email</label>
          <input id="email" value={user.email} readOnly className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="phone">Phone</label>
          <input id="phone" name="phone" type="tel" pattern="\+?[0-9][0-9\s\-]{9,14}" value={form.phone} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-leaf" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="specialization">Specialization</label>
          <select id="specialization" name="specialization" required value={form.specialization} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-leaf">
            <option value="">Select specialization</option>
            {specializations.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="experience">Experience (years)</label>
          <input id="experience" name="experience" type="number" min="0" max="60" step="1" required value={form.experience} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-leaf" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="qualification">Qualification</label>
          <input id="qualification" name="qualification" required maxLength="120" value={form.qualification} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-leaf" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="state">State</label>
          <select id="state" name="state" required value={form.state} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-leaf">
            <option value="">Select state</option>
            {locations.states.map((state) => <option key={state} value={state}>{state}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="district">District</label>
          <select id="district" name="district" required disabled={!form.state} value={form.district} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-leaf disabled:bg-slate-50">
            <option value="">{form.state ? 'Select district' : 'Select state first'}</option>
            {districts.map((district) => <option key={district} value={district}>{district}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="serviceRadius">Service Radius (km)</label>
          <input id="serviceRadius" name="serviceRadius" type="number" min="1" max="1000" step="1" required value={form.serviceRadius} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-leaf" />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="bio">Bio</label>
          <textarea id="bio" name="bio" maxLength="1000" value={form.bio} onChange={handleChange} rows={4} className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-leaf" />
          <p className="mt-1 text-right text-xs text-slate-500">{form.bio.length}/1000</p>
        </div>
        <div className="md:col-span-2 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
          Verification status is controlled by an administrator and cannot be changed here.
        </div>
        {verificationStatus === 'pending' ? (
          <div className="md:col-span-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Your profile is saved but waiting for admin verification. Farmers can see your profile after verification.
          </div>
        ) : null}
        {error ? <div className="md:col-span-2 text-sm text-red-600">{error}</div> : null}
        {success ? <div className="md:col-span-2 text-sm text-green-700">{success}</div> : null}
        <div className="md:col-span-2 flex justify-end">
          <button type="submit" disabled={saving} className="rounded-md bg-leaf px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-70">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ExpertProfilePage;
