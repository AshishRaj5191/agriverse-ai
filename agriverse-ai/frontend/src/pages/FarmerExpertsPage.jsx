import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIndianLocations, getVerifiedExperts } from '../services/api';

const specializations = [
  'Crop Disease Specialist',
  'Soil Specialist',
  'Horticulture Expert',
  'Irrigation Specialist',
  'Organic Farming Expert',
  'Pest Management Expert',
  'Agricultural Consultant',
];

function FarmerExpertsPage() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState({ states: [], districtsByState: {} });
  const [filters, setFilters] = useState({ state: '', district: '', specialization: '' });
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  async function searchExperts(nextFilters = filters) {
    setSearching(true);
    setError('');
    try {
      const response = await getVerifiedExperts(
        Object.fromEntries(Object.entries(nextFilters).filter(([, value]) => value))
      );
      setExperts(response?.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Your session is no longer valid. Please log in again.');
      } else {
        setError('Unable to load experts. Please try again.');
      }
      setExperts([]);
    } finally {
      setSearching(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    async function loadPage() {
      try {
        const locationResponse = await getIndianLocations();
        setLocations(locationResponse?.data || { states: [], districtsByState: {} });
        await searchExperts();
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load expert directory.');
        setLoading(false);
      }
    }

    loadPage();
  }, []);

  const districts = locations.districtsByState[filters.state] || [];

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'state') {
      setFilters((prev) => ({ ...prev, state: value, district: '' }));
      return;
    }
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    searchExperts();
  };

  const clearFilters = () => {
    const nextFilters = { state: '', district: '', specialization: '' };
    setFilters(nextFilters);
    searchExperts(nextFilters);
  };

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">Loading experts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Find Agricultural Experts</h1>
        <p className="mt-1 text-sm text-slate-600">Search verified experts by location and specialization.</p>
        <form onSubmit={handleSubmit} className="mt-5 grid gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="expert-state">State</label>
            <select id="expert-state" name="state" value={filters.state} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-leaf">
              <option value="">All states</option>
              {locations.states.map((state) => <option key={state} value={state}>{state}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="expert-district">District</label>
            <select id="expert-district" name="district" disabled={!filters.state} value={filters.district} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-leaf disabled:bg-slate-50">
              <option value="">All districts</option>
              {districts.map((district) => <option key={district} value={district}>{district}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="expert-specialization">Specialization</label>
            <select id="expert-specialization" name="specialization" value={filters.specialization} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-leaf">
              <option value="">All specializations</option>
              {specializations.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" disabled={searching} className="flex-1 rounded-md bg-leaf px-4 py-2 text-sm font-semibold text-white disabled:opacity-70">{searching ? 'Searching...' : 'Search Experts'}</button>
            <button type="button" onClick={clearFilters} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Clear</button>
          </div>
        </form>
      </div>

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
      {!error && experts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">No verified agricultural experts found for this location and specialization.</h2>
          <p className="mt-2 text-sm text-slate-600">Try another district or specialization.</p>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        {experts.map((expert) => (
          <article key={expert.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-green-700">Verified Agricultural Expert</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">{expert.name}</h2>
              </div>
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">Verified</span>
            </div>
            <p className="mt-3 font-semibold text-leaf">{expert.specialization}</p>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-slate-500">Qualification</dt><dd className="font-medium text-slate-800">{expert.qualification}</dd></div>
              <div><dt className="text-slate-500">Experience</dt><dd className="font-medium text-slate-800">{expert.experience} years</dd></div>
              <div><dt className="text-slate-500">Location</dt><dd className="font-medium text-slate-800">{expert.district}, {expert.state}</dd></div>
              <div><dt className="text-slate-500">Service radius</dt><dd className="font-medium text-slate-800">{expert.serviceRadius} km</dd></div>
            </dl>
            <p className="mt-4 text-sm leading-6 text-slate-600">{expert.bio || 'Professional agricultural guidance for local farmers.'}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={() => navigate(`/farmer/expert-consultation/${expert.id}`)} className="rounded-md bg-leaf px-4 py-2 text-sm font-semibold text-white">Contact Expert</button>
              {expert.phone ? <a href={`tel:${expert.phone}`} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Call Expert</a> : null}
              {expert.email ? <a href={`mailto:${expert.email}`} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Send Email</a> : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default FarmerExpertsPage;
