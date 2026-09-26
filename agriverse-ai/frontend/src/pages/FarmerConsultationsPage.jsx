import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getConsultation, getConsultationMessages, getFarmerConsultations, sendConsultationMessage } from '../services/api';

function FarmerConsultationsPage() {
  const { id } = useParams();
  const [consultations, setConsultations] = useState([]);
  const [consultation, setConsultation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      if (id) {
        const [detail, messageResponse] = await Promise.all([getConsultation(id), getConsultationMessages(id)]);
        setConsultation(detail.data); setMessages(messageResponse.data || []);
      } else {
        const response = await getFarmerConsultations(); setConsultations(response.data || []);
      }
    } catch (err) { setError(err?.response?.data?.message || 'Unable to load consultations.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [id]);

  async function send(event) { event.preventDefault(); if (!message.trim()) return; await sendConsultationMessage(id, message); setMessage(''); await load(); }
  const badge = (status) => <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold capitalize text-slate-700">{status}</span>;

  if (loading) return <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">Loading consultations...</div>;
  if (error) return <div className="rounded-xl bg-red-50 p-5 text-red-700">{error}</div>;
  if (id && !consultation) return <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">Consultation not found.</div>;
  if (id) return <div className="space-y-5"><Link to="/farmer/consultations" className="text-sm font-medium text-leaf">Back to consultations</Link><div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h1 className="text-2xl font-bold">{consultation.problemTitle || 'Consultation'}</h1><p className="mt-2 text-sm text-slate-600">Expert: {consultation.expert?.name || 'Expert'} · {consultation.cropName || 'Crop not specified'} · {badge(consultation.status || 'pending')}</p><p className="mt-4 whitespace-pre-wrap text-slate-700">{consultation.problemDescription || 'No description provided.'}</p>{consultation.images?.length ? <div className="mt-4 flex flex-wrap gap-2">{consultation.images.filter((image) => image?.url).map((image) => <img key={image.publicId || image.url} src={image.url} alt="Consultation crop" onError={(event) => { event.currentTarget.style.display = 'none'; }} className="h-24 w-24 rounded object-cover" />)}</div> : null}{consultation.expertResponse ? <div className="mt-4 rounded-lg bg-green-50 p-4"><p className="text-xs font-semibold uppercase text-green-700">Expert response</p><p className="mt-1 text-sm">{consultation.expertResponse.message || consultation.expertResponse.recommendation || 'Response received.'}</p></div> : null}</div><div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold">Conversation</h2><div className="mt-4 space-y-3">{Array.isArray(messages) && messages.length ? messages.map((item) => <div key={item._id} className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-semibold text-slate-500">{item.sender?.name || 'Participant'}</p><p className="mt-1 text-sm">{item.message || ''}</p></div>) : <p className="text-sm text-slate-500">No messages yet.</p>}</div><form onSubmit={send} className="mt-4 flex gap-2"><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Type a message..." className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2" /><button className="rounded-md bg-leaf px-4 py-2 font-semibold text-white">Send</button></form></div></div>;

  return <div className="space-y-5"><div><h1 className="text-2xl font-bold text-slate-900">My Consultations</h1><p className="mt-1 text-sm text-slate-600">Track requests and communicate with verified experts.</p></div>{consultations.length === 0 ? <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">No consultation requests yet.</div> : <div className="grid gap-4">{consultations.map((item) => <Link key={item._id} to={`/farmer/consultations/${item._id}`} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex justify-between gap-3"><h2 className="font-semibold">{item.problemTitle}</h2>{badge(item.status)}</div><p className="mt-2 text-sm text-slate-600">{item.cropName} · Expert: {item.expert?.name} · {item.district}, {item.state}</p></Link>)}</div>}</div>;
}

export default FarmerConsultationsPage;
