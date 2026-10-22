import { useEffect, useState } from 'react';
import { createGovernmentScheme, deleteGovernmentScheme, getGovernmentSchemes, updateGovernmentScheme } from '../services/api';

const emptyForm = {
  title: '',
  description: '',
  governmentLevel: 'Central Government',
  state: 'All India',
  districts: '',
  category: 'Financial Support',
  targetFarmers: '',
  benefits: '',
  eligibility: '',
  documents: '',
  applicationSteps: '',
  officialWebsite: '',
  officialStatusUrl: '',
  officialApplicationUrl: '',
  sourceName: 'Official Government Portal',
  sourceUrl: '',
  lastVerifiedAt: '',
  isActive: true,
};

function parseList(value) {
  return String(value || '')
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function AdminGovernmentSchemesPage() {
  const [schemes, setSchemes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadSchemes() {
    try {
      const response = await getGovernmentSchemes();
      setSchemes(response?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load schemes.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSchemes();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        ...form,
        districts: parseList(form.districts),
        benefits: parseList(form.benefits),
        eligibility: parseList(form.eligibility),
        documents: parseList(form.documents),
        applicationSteps: parseList(form.applicationSteps),
        lastVerifiedAt: form.lastVerifiedAt || new Date().toISOString(),
      };

      if (editingId) {
        await updateGovernmentScheme(editingId, payload);
      } else {
        await createGovernmentScheme(payload);
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadSchemes();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to save scheme.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (scheme) => {
    setEditingId(scheme.id || scheme._id);
    setForm({
      ...emptyForm,
      ...scheme,
      districts: Array.isArray(scheme.districts) ? scheme.districts.join('\n') : '',
      benefits: Array.isArray(scheme.benefits) ? scheme.benefits.join('\n') : '',
      eligibility: Array.isArray(scheme.eligibility) ? scheme.eligibility.join('\n') : '',
      documents: Array.isArray(scheme.documents) ? scheme.documents.join('\n') : '',
      applicationSteps: Array.isArray(scheme.applicationSteps) ? scheme.applicationSteps.join('\n') : '',
      officialStatusUrl: scheme.officialStatusUrl || scheme.statusUrl || '',
      officialApplicationUrl: scheme.officialApplicationUrl || scheme.applicationUrl || '',
      lastVerifiedAt: scheme.lastVerifiedAt ? String(scheme.lastVerifiedAt).slice(0, 10) : '',
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteGovernmentScheme(id);
      await loadSchemes();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to deactivate scheme.');
    }
  };

  const handleReactivate = async (id) => {
    try {
      await updateGovernmentScheme(id, { isActive: true });
      await loadSchemes();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to reactivate scheme.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Admin</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Government Scheme Management</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Edit scheme' : 'Add new scheme'}</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Scheme title</label>
              <input name="title" value={form.title} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" required />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows="3" className="w-full rounded-lg border border-slate-300 px-3 py-2" required />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Government level</label>
              <select name="governmentLevel" value={form.governmentLevel} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                <option value="Central Government">Central Government</option>
                <option value="State Government">State Government</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">State</label>
              <input name="state" value={form.state} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                <option value="Financial Support">Financial Support</option>
                <option value="Agricultural Loan">Agricultural Loan</option>
                <option value="Crop Insurance">Crop Insurance</option>
                <option value="Farm Equipment">Farm Equipment</option>
                <option value="Irrigation">Irrigation</option>
                <option value="Agriculture Infrastructure">Agriculture Infrastructure</option>
                <option value="Agriculture Support">Agriculture Support</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Target farmers</label>
              <input name="targetFarmers" value={form.targetFarmers} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Districts (one per line)</label>
              <input name="districts" value={form.districts} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Benefits (one per line)</label>
              <textarea name="benefits" value={form.benefits} onChange={handleChange} rows="3" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Eligibility (one per line)</label>
              <textarea name="eligibility" value={form.eligibility} onChange={handleChange} rows="3" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Required documents (one per line)</label>
              <textarea name="documents" value={form.documents} onChange={handleChange} rows="3" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Application steps (one per line)</label>
              <textarea name="applicationSteps" value={form.applicationSteps} onChange={handleChange} rows="3" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Official website</label>
              <input name="officialWebsite" value={form.officialWebsite} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Official status URL</label>
              <input name="officialStatusUrl" value={form.officialStatusUrl} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Official application URL</label>
              <input name="officialApplicationUrl" value={form.officialApplicationUrl} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Source name</label>
              <input name="sourceName" value={form.sourceName} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Source URL</label>
              <input name="sourceUrl" value={form.sourceUrl} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Last verified date</label>
              <input type="date" name="lastVerifiedAt" value={form.lastVerifiedAt} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>

            <label className="md:col-span-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
              Active for farmer view
            </label>
          </div>

          {error ? <div className="mt-4 text-sm text-red-600">{error}</div> : null}

          <div className="mt-5 flex justify-end gap-3">
            {editingId ? (
              <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
                Cancel
              </button>
            ) : null}
            <button type="submit" disabled={saving} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70">
              {saving ? 'Saving...' : editingId ? 'Update scheme' : 'Add scheme'}
            </button>
          </div>
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Current schemes</h2>
          {loading ? (
            <div className="mt-4 text-sm text-slate-600">Loading...</div>
          ) : (
            <div className="mt-4 space-y-3">
              {schemes.map((scheme) => (
                <div key={scheme.id || scheme._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{scheme.title}</p>
                      <p className="text-xs text-slate-500">{scheme.governmentLevel} • {scheme.category}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${scheme.isActive === false ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {scheme.isActive === false ? 'inactive' : 'active'}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => handleEdit(scheme)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700">Edit</button>
                    {scheme.isActive === false ? (
                      <button type="button" onClick={() => handleReactivate(scheme.id || scheme._id)} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">Reactivate</button>
                    ) : (
                      <button type="button" onClick={() => handleDelete(scheme.id || scheme._id)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700">Deactivate</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminGovernmentSchemesPage;
