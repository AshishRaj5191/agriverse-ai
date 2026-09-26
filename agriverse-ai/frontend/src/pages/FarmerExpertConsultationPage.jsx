import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { createConsultation } from '../services/api';
import { getCurrentUser } from '../utils/auth';

const initialForm = { state: '', district: '', cropName: '', cropStage: '', problemTitle: '', problemDescription: '', symptoms: '', affectedArea: '', preferredContactTime: '', additionalInformation: '' };

function FarmerExpertConsultationPage() {
  const { expertId } = useParams();
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = getCurrentUser();

  useEffect(() => {
    async function loadExpert() {
      try {
        const [expertResponse, farmerResponse] = await Promise.all([
          api.get('/farmers/experts'),
          api.get('/farmers/profile'),
        ]);
        const selected = (expertResponse.data.data || []).find((item) => item.id === expertId);
        if (!selected) throw new Error('Verified expert not found.');
        setExpert(selected);
        const farmerProfile = farmerResponse.data.data?.profile || {};
        setForm((current) => ({
          ...current,
          state: farmerProfile.state || '',
          district: farmerProfile.district || '',
        }));
      } catch (err) {
        setError(err?.response?.status === 401 ? 'Your session is no longer valid. Please log in again.' : 'Unable to load this expert.');
      } finally { setLoading(false); }
    }
    loadExpert();
  }, [expertId]);

  function updateField(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }

  function handleFiles(event) {
    const selected = Array.from(event.target.files || []).slice(0, 5);
    const valid = selected.filter((file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type) && file.size <= 5 * 1024 * 1024);
    if (valid.length !== selected.length) { setError('Use up to five JPEG, PNG, or WEBP images under 5MB each.'); return; }
    setImages(valid);
    setPreviews(valid.map((file) => URL.createObjectURL(file)));
    setError('');
  }

  async function submit(event) {
    event.preventDefault();
    setSending(true); setError(''); setSuccess('');
    try {
      const response = await createConsultation({ expertId, ...form }, images);
      setSuccess(response.message || 'Consultation request sent successfully to the expert.');
      setTimeout(() => navigate(`/farmer/consultations/${response.data._id}`), 500);
    } catch (err) { setError(err?.response?.data?.message || 'Unable to send consultation request.'); }
    finally { setSending(false); }
  }

  if (loading) return <div className="rounded-2xl border border-slate-200 bg-white p-6">Loading expert...</div>;
  if (error && !expert) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link to="/farmer/experts" className="text-sm font-medium text-leaf">Back to experts</Link>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Verified Expert</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Contact {expert.name}</h1>
        <p className="mt-1 text-sm text-slate-600">{expert.specialization} · {expert.district}, {expert.state}</p>
        <p className="mt-3 text-sm text-slate-600">Farmer: {user?.name || 'Signed-in farmer'}{user?.email ? ` (${user.email})` : ''}</p>
        <form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-2">
          {['state', 'district', 'cropName', 'cropStage', 'problemTitle', 'affectedArea', 'preferredContactTime'].map((field) => (
            <div key={field}>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor={field}>{field === 'cropName' ? 'Crop name' : field === 'problemTitle' ? 'Problem title' : field.replace(/([A-Z])/g, ' $1')}</label>
              <input id={field} name={field} required={['state', 'district', 'cropName', 'problemTitle'].includes(field)} value={form[field]} onChange={updateField} className="w-full rounded-md border border-slate-300 px-3 py-2" />
            </div>
          ))}
          <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="problemDescription">Problem description</label><textarea id="problemDescription" name="problemDescription" required maxLength="4000" rows="4" value={form.problemDescription} onChange={updateField} className="w-full rounded-md border border-slate-300 px-3 py-2" /></div>
          <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="symptoms">Symptoms/details</label><textarea id="symptoms" name="symptoms" rows="3" value={form.symptoms} onChange={updateField} className="w-full rounded-md border border-slate-300 px-3 py-2" /></div>
          <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="additionalInformation">Additional information</label><textarea id="additionalInformation" name="additionalInformation" rows="3" value={form.additionalInformation} onChange={updateField} className="w-full rounded-md border border-slate-300 px-3 py-2" /></div>
          <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="images">Crop/problem images (up to 5)</label><input id="images" type="file" accept=".jpg,.jpeg,.png,.webp" multiple onChange={handleFiles} className="w-full rounded-md border border-slate-300 px-3 py-2" /><div className="mt-3 flex flex-wrap gap-2">{previews.map((preview) => <img key={preview} src={preview} alt="Selected crop" className="h-20 w-20 rounded object-cover" />)}</div></div>
          {error ? <p className="md:col-span-2 text-sm text-red-600">{error}</p> : null}
          {success ? <p className="md:col-span-2 text-sm text-green-700">{success}</p> : null}
          <button type="submit" disabled={sending} className="md:col-span-2 rounded-md bg-leaf px-4 py-3 font-semibold text-white disabled:opacity-60">{sending ? 'Sending...' : 'Send Request to Expert'}</button>
        </form>
      </div>
    </div>
  );
}

export default FarmerExpertConsultationPage;
