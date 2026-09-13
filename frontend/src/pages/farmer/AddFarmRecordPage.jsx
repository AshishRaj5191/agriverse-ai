import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createFarmRecord } from '../../services/api';

function AddFarmRecordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    crop: '',
    cropVariety: '',
    sowingDate: '',
    expectedHarvestDate: '',
    soilInfo: '',
    notes: '',
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!form.crop || !form.sowingDate) {
        throw new Error('Crop name and sowing date are required.');
      }

      await createFarmRecord(form);
      navigate('/farmer/farm-records');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create farm record.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Add Farm Record</h1>
        <p className="mt-1 text-sm text-slate-600">
          Create a new farm record to track your crops and farming activities.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-slate-200 bg-white p-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Crop Name *
            </label>
            <input
              type="text"
              required
              value={form.crop}
              onChange={(e) => setForm({ ...form, crop: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-leaf focus:ring"
              placeholder="e.g., Tomato, Wheat, Rice"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Crop Variety
            </label>
            <input
              type="text"
              value={form.cropVariety}
              onChange={(e) => setForm({ ...form, cropVariety: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-leaf focus:ring"
              placeholder="e.g., Cherry Tomato, Basmati Rice"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Sowing Date *
            </label>
            <input
              type="date"
              required
              value={form.sowingDate}
              onChange={(e) => setForm({ ...form, sowingDate: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-leaf focus:ring"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Expected Harvest Date
            </label>
            <input
              type="date"
              value={form.expectedHarvestDate}
              onChange={(e) => setForm({ ...form, expectedHarvestDate: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-leaf focus:ring"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Soil Information
          </label>
          <textarea
            value={form.soilInfo}
            onChange={(e) => setForm({ ...form, soilInfo: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-leaf focus:ring"
            rows={3}
            placeholder="Describe soil type, pH level, moisture, etc."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Additional Notes
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-leaf focus:ring"
            rows={3}
            placeholder="Any other relevant information..."
          />
        </div>

        <div className="flex gap-3 border-t border-slate-200 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-leaf px-6 py-2.5 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Record'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/farmer/farm-records')}
            className="rounded-md border border-slate-300 bg-white px-6 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddFarmRecordPage;
