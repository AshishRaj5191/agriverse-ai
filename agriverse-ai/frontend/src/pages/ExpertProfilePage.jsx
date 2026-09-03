import { useEffect, useState } from 'react';
import api from '../services/api';
import { getToken } from '../utils/auth';

const defaultForm = {
  phone: '',
  specialization: '',
  experience: '',
  qualification: '',
  state: '',
  district: '',
  serviceRadius: '',
  bio: '',
  verificationStatus: 'pending',
};

function ExpertProfilePage() {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = getToken();
        const response = await api.get('/experts/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profile = response?.data?.data?.profile || {};
        setForm({ ...defaultForm, ...profile });
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load expert profile.');
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
      await api.put('/experts/profile', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Expert profile saved successfully.');
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
      <h1 className="text-2xl font-bold text-slate-900">Expert Profile</h1>
      <p className="mt-1 text-sm text-slate-600">Update your professional details and verification profile.</p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        {[
          ['phone', 'Phone'],
          ['specialization', 'Specialization'],
          ['experience', 'Experience'],
          ['qualification', 'Qualification'],
          ['state', 'State'],
          ['district', 'District'],
          ['serviceRadius', 'Service Radius'],
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

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-leaf"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Verification Status</label>
          <select
            name="verificationStatus"
            value={form.verificationStatus}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-leaf"
          >
            <option value="pending">pending</option>
            <option value="verified">verified</option>
            <option value="rejected">rejected</option>
          </select>
        </div>

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

export default ExpertProfilePage;
