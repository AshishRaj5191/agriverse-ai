import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { acceptConsultation, declineConsultation, getConsultation, getConsultationMessages, getExpertConsultations, respondToConsultation, sendConsultationMessage } from '../services/api';

function ExpertConsultationsPage() {
  const { id } = useParams();
  const [requests, setRequests] = useState([]);
  const [consultation, setConsultation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [response, setResponse] = useState({ diagnosis: '', recommendation: '', message: '', visitRequired: false, visitDate: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      if (id) {
        const [detail, messageResponse] = await Promise.all([getConsultation(id), getConsultationMessages(id)]);
        setConsultation(detail.data); setResponse({ diagnosis: detail.data.expertResponse?.diagnosis || '', recommendation: detail.data.expertResponse?.recommendation || '', message: detail.data.expertResponse?.message || '', visitRequired: detail.data.expertResponse?.visitRequired || false, visitDate: detail.data.expertResponse?.visitDate?.slice?.(0, 10) || '' }); setMessages(messageResponse.data || []);
      } else { setRequests((await getExpertConsultations()).data || []); }
    } catch (err) { setError(err?.response?.data?.message || 'Unable to load consultation requests.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [id]);
  async function respond(status) { await respondToConsultation(id, { status, ...response }); await load(); }
  async function send(event) { event.preventDefault(); if (!message.trim()) return; await sendConsultationMessage(id, message); setMessage(''); await load(); }
  const badge = (status) => <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold capitalize text-slate-700">{status}</span>;

  if (loading) return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">Loading consultation requests...</div>;
  if (error) return <div className="rounded-xl bg-red-50 p-5 text-red-700">{error}</div>;
  if (id && !consultation) return <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">Consultation not found.</div>;
  if (id) return <div className="space-y-5"><Link to="/expert/consultations" className="text-sm font-medium text-leaf">Back to requests</Link><div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h1 className="text-2xl font-bold">{consultation.problemTitle || 'Consultation'}</h1><p className="mt-2 text-sm text-slate-600">Farmer: {consultation.farmer?.name || 'Farmer'} · {consultation.cropName || 'Crop not specified'} · {badge(consultation.status || 'pending')}</p><p className="mt-4 whitespace-pre-wrap text-slate-700">{consultation.problemDescription || 'No description provided.'}</p>{consultation.images?.length ? <div className="mt-4 flex flex-wrap gap-2">{consultation.images.filter((image) => image?.url).map((image) => <img key={image.publicId || image.url} src={image.url} alt="Consultation crop" onError={(event) => { event.currentTarget.style.display = 'none'; }} className="h-24 w-24 rounded object-cover" />)}</div> : null}<p className="mt-3 text-sm text-slate-600">Location: {consultation.district || 'Unknown'}, {consultation.state || 'Unknown'}</p><div className="mt-5 grid gap-3"><textarea value={response.diagnosis} onChange={(event) => setResponse((current) => ({ ...current, diagnosis: event.target.value }))} placeholder="Diagnosis / Observation" rows="3" className="w-full rounded-md border border-slate-300 px-3 py-2" /><textarea value={response.recommendation} onChange={(event) => setResponse((current) => ({ ...current, recommendation: event.target.value }))} placeholder="Recommendation / Treatment Advice" rows="3" className="w-full rounded-md border border-slate-300 px-3 py-2" /><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={response.visitRequired} onChange={(event) => setResponse((current) => ({ ...current, visitRequired: event.target.checked }))} /> Farm visit required</label>{response.visitRequired ? <input type="date" value={response.visitDate} onChange={(event) => setResponse((current) => ({ ...current, visitDate: event.target.value }))} className="rounded-md border border-slate-300 px-3 py-2" /> : null}<textarea value={response.message} onChange={(event) => setResponse((current) => ({ ...current, message: event.target.value }))} placeholder="Additional message" rows="3" className="w-full rounded-md border border-slate-300 px-3 py-2" /></div><div className="mt-3 flex gap-2"><button type="button" onClick={() => respond('accepted')} className="rounded-md bg-green-600 px-4 py-2 font-semibold text-white">Accept & Respond</button><button type="button" onClick={() => declineConsultation(id).then(load)} className="rounded-md bg-red-600 px-4 py-2 font-semibold text-white">Decline Request</button>{consultation.status === 'accepted' || consultation.status === 'responded' ? <button type="button" onClick={() => respond('closed')} className="rounded-md border border-slate-300 px-4 py-2 font-semibold">Close</button> : null}</div></div><div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold">Conversation</h2><div className="mt-4 space-y-3">{Array.isArray(messages) && messages.length ? messages.map((item) => <div key={item._id} className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-semibold text-slate-500">{item.sender?.name || 'Participant'}</p><p className="mt-1 text-sm">{item.message || ''}</p></div>) : <p className="text-sm text-slate-500">No messages yet.</p>}</div><form onSubmit={send} className="mt-4 flex gap-2"><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Reply to farmer..." className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2" /><button className="rounded-md bg-leaf px-4 py-2 font-semibold text-white">Send</button></form></div></div>;

  return <div className="space-y-5"><h1 className="text-2xl font-bold text-slate-900">Farmer Consultation Requests</h1>{requests.length === 0 ? <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">No consultation requests yet.</div> : <div className="grid gap-4">{requests.map((item) => <Link key={item._id} to={`/expert/consultations/${item._id}`} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex justify-between gap-3"><h2 className="font-semibold">{item.problemTitle}</h2>{badge(item.status)}</div><p className="mt-2 text-sm text-slate-600">Farmer: {item.farmer?.name} · {item.cropName} · {item.district}, {item.state}</p></Link>)}</div>}</div>;
}

export default ExpertConsultationsPage;
