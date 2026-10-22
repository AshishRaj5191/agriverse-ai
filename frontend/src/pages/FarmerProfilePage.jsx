import { useEffect, useState } from 'react';
import api from '../services/api';
import { getToken } from '../utils/auth';

const defaultForm = {
  phone: '',
  state: '',
  district: '',
  village: '',
  pincode: '',
  farmSize: '',
  soilType: '',
  irrigationType: '',
  primaryCrops: '',
  preferredLanguage: '',
};

function FarmerProfilePage() {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = getToken();
        const response = await api.get('/farmers/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profile = response?.data?.data?.profile || {};
        setForm({ ...defaultForm, ...profile });
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load farmer profile.');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const token = getToken();
      await api.put('/farmers/profile', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Farmer profile saved successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to save farmer profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">Loading profile...</div>;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Farmer Profile</h1>
      <p className="mt-1 text-sm text-slate-600">Manage your farm details and personal information.</p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        {[
          ['phone', 'Phone'],
          ['state', 'State'],
          ['district', 'District'],
          ['village', 'Village'],
          ['pincode', 'Pincode'],
          ['farmSize', 'Farm Size'],
          ['soilType', 'Soil Type'],
          ['irrigationType', 'Irrigation Type'],
          ['primaryCrops', 'Primary Crops'],
          ['preferredLanguage', 'Preferred Language'],
        ].map(([name, label]) => (
          <div key={name}>
            <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
            <input
              name={name}
              value={form[name]}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-leaf"
            />
          </div>
        ))}

        {error ? <div className="md:col-span-2 text-sm text-red-600">{error}</div> : null}

        <div className="md:col-span-2 flex justify-end">
          <button type="submit" disabled={saving} className="rounded-md bg-leaf px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-70">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FarmerProfilePage;
