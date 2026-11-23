import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { closeConsultation, getConsultation, getConsultationMessages, getFarmerConsultations, sendConsultationMessage } from '../services/api';

function statusStyle(status = 'pending') {
  const styles = {
    pending: 'bg-amber-100 text-amber-800',
    accepted: 'bg-blue-100 text-blue-800',
    responded: 'bg-emerald-100 text-emerald-800',
    completed: 'bg-slate-200 text-slate-700',
    closed: 'bg-slate-200 text-slate-700',
    declined: 'bg-red-100 text-red-700',
    rejected: 'bg-red-100 text-red-700',
  };
  return styles[status] || styles.pending;
}

function StatusBadge({ status }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyle(status)}`}>{status}</span>;
}

function StatusTimeline({ status = 'pending', createdAt, expertResponseAt }) {
  const isClosed = ['declined', 'rejected', 'closed', 'completed'].includes(status);
  const isResponded = ['responded', 'accepted', 'completed', 'closed'].includes(status);
  const steps = [
    { label: 'Request sent', date: createdAt, complete: Boolean(createdAt) },
    { label: 'Expert accepted', date: null, complete: status !== 'pending' && status !== 'declined' && status !== 'rejected' },
    { label: 'Expert response', date: expertResponseAt, complete: isResponded },
    { label: isClosed ? 'Consultation closed' : 'Follow-up', date: null, complete: isClosed },
  ];

  return (
    <div className="mt-5">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Status timeline</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        {steps.map((step, index) => (
          <div key={step.label} className="relative">
            {index < steps.length - 1 ? <div className={`absolute left-7 top-4 hidden h-px w-full sm:block ${step.complete ? 'bg-emerald-400' : 'bg-slate-200'}`} /> : null}
            <div className="relative flex items-center gap-2">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${step.complete ? 'bg-emerald-700 text-white' : 'border border-slate-200 bg-white text-slate-400'}`}>
                {step.complete ? '✓' : index + 1}
              </span>
              <div className="min-w-0">
                <p className={`text-xs font-semibold ${step.complete ? 'text-slate-800' : 'text-slate-400'}`}>{step.label}</p>
                {step.date ? <p className="mt-0.5 text-[10px] text-slate-500">{new Date(step.date).toLocaleDateString()}</p> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FarmerConsultationsPage() {
  const { id } = useParams();
  const [consultations, setConsultations] = useState([]);
  const [consultation, setConsultation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatImages, setChatImages] = useState([]);
  const [chatPreviews, setChatPreviews] = useState([]);
  const [closing, setClosing] = useState(false);
  const [filter, setFilter] = useState('all');

  async function load() {
    try {
      setError('');
      if (id) {
        const [detail, messageResponse] = await Promise.all([getConsultation(id), getConsultationMessages(id)]);
        setConsultation(detail.data);
        setMessages(messageResponse.data || []);
      } else {
        const response = await getFarmerConsultations();
        setConsultations(response.data || []);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load consultations.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    load();
  }, [id]);

  async function send(event) {
    event.preventDefault();
    if (!message.trim() && !chatImages.length) return;
    try {
      setSending(true);
      setError('');
      await sendConsultationMessage(id, message, chatImages);
      setMessage('');
      setChatImages([]);
      setChatPreviews([]);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to send the message.');
    } finally {
      setSending(false);
    }
  }

  function handleChatImages(event) {
    const files = Array.from(event.target.files || []).slice(0, 3);
    const valid = files.filter((file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type) && file.size <= 5 * 1024 * 1024);
    if (valid.length !== files.length) {
      setError('Upload up to three JPEG, PNG, or WEBP images under 5MB each.');
      return;
    }
    chatPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    setChatImages(valid);
    setChatPreviews(valid.map((file) => URL.createObjectURL(file)));
  }

  async function requestFollowUp() {
    if (!message.trim()) setMessage('I would like to request a follow-up for this consultation.');
  }

  async function markClosed() {
    if (!window.confirm('Close this consultation? You will not be able to send more messages.')) return;
    try {
      setClosing(true);
      await closeConsultation(id);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to close this consultation.');
    } finally {
      setClosing(false);
    }
  }

  const counts = useMemo(() => ({
    all: consultations.length,
    pending: consultations.filter((item) => item.status === 'pending').length,
    active: consultations.filter((item) => ['accepted', 'responded'].includes(item.status)).length,
    closed: consultations.filter((item) => ['declined', 'rejected', 'closed', 'completed'].includes(item.status)).length,
  }), [consultations]);

  const visibleConsultations = useMemo(() => {
    if (filter === 'pending') return consultations.filter((item) => item.status === 'pending');
    if (filter === 'active') return consultations.filter((item) => ['accepted', 'responded'].includes(item.status));
    if (filter === 'closed') return consultations.filter((item) => ['declined', 'rejected', 'closed', 'completed'].includes(item.status));
    return consultations;
  }, [consultations, filter]);

  if (loading) return <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">Loading consultations...</div>;
  if (error && !id) return <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>;
  if (id && !consultation) return <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">{error || 'Consultation not found.'}</div>;

  if (id) {
    const messagingClosed = ['declined', 'rejected', 'closed', 'completed'].includes(consultation.status);
    const messagingPending = consultation.status === 'pending';

    return (
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex items-center justify-between">
          <Link to="/farmer/consultations" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700">← Back to My Consultations</Link>
          {!messagingClosed ? (
            <div className="flex gap-2">
              <button type="button" onClick={requestFollowUp} className="hidden rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 sm:inline-flex">Request Follow-up</button>
              <button type="button" onClick={markClosed} disabled={closing} className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-bold text-red-700 disabled:opacity-50">{closing ? 'Closing...' : 'Mark as Closed'}</button>
            </div>
          ) : null}
        </div>
        {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.75fr)]">
          <main className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">{consultation.cropName || 'Crop'} consultation</p>
                  <h1 className="mt-2 text-2xl font-black text-slate-950">{consultation.problemTitle || 'Consultation'}</h1>
                  <p className="mt-2 text-xs font-medium text-slate-500">Requested {consultation.createdAt ? new Date(consultation.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : ''}</p>
                </div>
                <StatusBadge status={consultation.status || 'pending'} />
              </div>
              <StatusTimeline
                status={consultation.status}
                createdAt={consultation.createdAt}
                expertResponseAt={consultation.expertResponseAt || consultation.expertResponse?.respondedAt}
              />
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black text-slate-900">Problem Details</h2>
              <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-700">{consultation.problemDescription || 'No description provided.'}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ['Crop stage', consultation.cropStage],
                  ['Affected area', consultation.affectedArea],
                  ['Symptoms', consultation.symptoms],
                  ['Preferred time', consultation.preferredContactTime],
                  ['Location', `${consultation.district || ''}${consultation.district && consultation.state ? ', ' : ''}${consultation.state || ''}`],
                ].filter(([, value]) => value).map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-500">{label}</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">{value}</p>
                  </div>
                ))}
              </div>
              {consultation.images?.length ? (
                <div className="mt-5">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Crop images</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {consultation.images.filter((image) => image?.url).map((image) => <a key={image.publicId || image.url} href={image.url} target="_blank" rel="noreferrer"><img src={image.url} alt="Consultation crop" onError={(event) => { event.currentTarget.style.display = 'none'; }} className="h-36 w-full rounded-2xl object-cover ring-1 ring-slate-200 transition hover:scale-[1.02]" /></a>)}
                  </div>
                </div>
              ) : null}
            </section>

            <section className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">Expert Diagnosis & Recommendation</p>
                  <h2 className="mt-2 text-lg font-black text-slate-900">{consultation.expert?.name || 'Assigned Expert'}</h2>
                  <p className="text-sm text-slate-600">{consultation.expertProfile?.specialization || 'Agricultural Expert'} · {consultation.district || consultation.state || 'Expert location'}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">Verified</span>
              </div>
              {consultation.expertResponse?.diagnosis || consultation.expertResponse?.recommendation || consultation.expertResponse?.message ? (
                <div className="mt-5 space-y-4">
                  {consultation.expertResponse.diagnosis ? <div className="rounded-2xl bg-white/80 p-4"><p className="text-xs font-bold text-slate-500">Diagnosis</p><p className="mt-2 text-sm leading-7 text-slate-800">{consultation.expertResponse.diagnosis}</p></div> : null}
                  {consultation.expertResponse.recommendation ? <div className="rounded-2xl bg-white/80 p-4"><p className="text-xs font-bold text-slate-500">Recommendation</p><p className="mt-2 text-sm leading-7 text-slate-800">{consultation.expertResponse.recommendation}</p></div> : null}
                  {consultation.expertResponse.message ? <p className="whitespace-pre-wrap rounded-2xl bg-white/80 p-4 text-sm leading-7 text-slate-800">{consultation.expertResponse.message}</p> : null}
                  {consultation.expertResponse.visitRequired ? <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">Farm visit recommended{consultation.expertResponse.visitDate ? ` on ${new Date(consultation.expertResponse.visitDate).toLocaleDateString()}` : ''}.</p> : null}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-emerald-200 bg-white/60 p-5 text-sm text-slate-600">The expert has not responded yet. You will receive a notification as soon as an answer is submitted.</div>
              )}
            </section>
          </main>

          <aside className="flex min-h-[540px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] lg:max-h-[760px]">
            <div className="border-b border-slate-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Consultation Chat</p>
                  <h2 className="mt-1 font-black text-slate-900">{consultation.expert?.name || 'Expert'}</h2>
                </div>
                <span className={`h-3 w-3 rounded-full ${messagingClosed ? 'bg-slate-300' : 'bg-emerald-500'}`} title={messagingClosed ? 'Closed' : 'Available'} />
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-4">
              {messages.length ? messages.map((item) => {
                const currentIsFarmer = item.sender?.role === 'farmer';
                return (
                  <div key={item._id} className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-sm ${currentIsFarmer ? 'ml-auto rounded-br-md bg-emerald-700 text-white' : 'mr-auto rounded-bl-md border border-slate-200 bg-white text-slate-800'}`}>
                    <p className={`text-[10px] font-bold ${currentIsFarmer ? 'text-emerald-100' : 'text-slate-500'}`}>{item.sender?.name || 'Participant'}</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{item.message || ''}</p>
                    {item.attachments?.length ? <div className="mt-2 grid gap-2">{item.attachments.map((attachment) => <a key={attachment.publicId || attachment.url} href={attachment.url} target="_blank" rel="noreferrer"><img src={attachment.url} alt="Chat attachment" className="max-h-44 w-full rounded-xl object-cover" /></a>)}</div> : null}
                    {item.createdAt ? <p className={`mt-2 text-[10px] ${currentIsFarmer ? 'text-emerald-100' : 'text-slate-400'}`}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p> : null}
                  </div>
                );
              }) : <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-center text-sm text-slate-500">No messages yet. {messagingPending ? 'The expert must accept the request first.' : 'Start the conversation.'}</div>}
            </div>
            {messagingPending ? (
              <p className="m-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Messaging starts after expert acceptance.</p>
            ) : messagingClosed ? (
              <p className="m-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">This consultation is closed.</p>
            ) : (
              <form onSubmit={send} className="border-t border-slate-100 p-4">
                {chatPreviews.length ? <div className="mb-3 flex gap-2">{chatPreviews.map((preview) => <img key={preview} src={preview} alt="Selected attachment" className="h-14 w-14 rounded-lg object-cover ring-1 ring-slate-200" />)}</div> : null}
                <div className="flex items-end gap-2">
                  <label className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600" title="Upload image">
                    <span aria-hidden="true">📎</span>
                    <input type="file" accept=".jpg,.jpeg,.png,.webp" multiple onChange={handleChatImages} className="hidden" />
                  </label>
                  <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Type a message..." rows="1" className="max-h-28 min-h-11 min-w-0 flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
                  <button type="submit" disabled={(!message.trim() && !chatImages.length) || sending} className="h-11 shrink-0 rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white disabled:opacity-50">{sending ? '...' : 'Send'}</button>
                </div>
              </form>
            )}
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-amber-50/40 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Expert Support</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">My Consultations</h1>
            <p className="mt-2 text-sm text-slate-600">Track and manage all your expert consultations</p>
          </div>
          <Link to="/farmer/experts" className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-800">+ New Consultation</Link>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['all', 'Total Consultations', counts.all, 'TC', 'border-slate-200 bg-white text-slate-700'],
          ['pending', 'Pending', counts.pending, 'PN', 'border-amber-200 bg-amber-50/70 text-amber-700'],
          ['active', 'Active', counts.active, 'AC', 'border-blue-200 bg-blue-50/70 text-blue-700'],
          ['closed', 'Closed', counts.closed, 'CL', 'border-slate-200 bg-slate-100/80 text-slate-600'],
        ].map(([value, label, count, icon, color]) => (
          <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 ${filter === value ? 'ring-2 ring-emerald-500 ring-offset-2' : ''} ${color}`}>
            <div className="flex items-start justify-between">
              <p className="text-sm font-bold">{label}</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/80 text-[10px] font-black shadow-sm">{icon}</span>
            </div>
            <p className="mt-4 text-3xl font-black text-slate-900">{count}</p>
          </button>
        ))}
      </div>

      {visibleConsultations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-lg font-semibold text-slate-800">{consultations.length ? 'No consultations in this status' : 'No consultation requests yet'}</p>
          <p className="mt-2 text-sm text-slate-600">Choose a verified expert and share crop symptoms for a personalized response.</p>
          <Link to="/farmer/experts" className="mt-5 inline-flex rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white">Find an Expert</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {visibleConsultations.map((item) => {
            const expertPreview = item.expertResponse?.diagnosis || item.expertResponse?.recommendation || item.expertResponse?.message;
            const cropImage = item.images?.find((image) => image?.url)?.url;
            return (
              <article key={item._id} className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row">
                  {cropImage ? (
                    <img src={cropImage} alt={item.cropName || 'Crop'} className="h-32 w-full shrink-0 rounded-xl object-cover sm:h-24 sm:w-24" />
                  ) : (
                    <div className="flex h-32 w-full shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-green-50 text-sm font-black text-emerald-700 sm:h-24 sm:w-24">
                      {(item.cropName || 'Crop').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">{item.cropName || 'Crop'}</p>
                        <h2 className="mt-1 text-lg font-bold text-slate-900 group-hover:text-emerald-700">{item.problemTitle}</h2>
                      </div>
                      <StatusBadge status={item.status || 'pending'} />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs font-medium text-slate-500">
                      <span>Expert: <strong className="text-slate-700">{item.expert?.name || 'Unassigned'}</strong></span>
                      <span>{item.district || 'Unknown district'}, {item.state || 'Unknown state'}</span>
                      <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>
                    </div>
                    {expertPreview ? (
                      <p className="mt-3 line-clamp-2 rounded-xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600"><strong className="text-slate-700">Expert update:</strong> {expertPreview}</p>
                    ) : (
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">{item.problemDescription}</p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link to={`/farmer/consultations/${item._id}`} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700">View Details</Link>
                      <Link to={`/farmer/consultations/${item._id}`} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-800">{['pending', 'declined', 'rejected', 'closed', 'completed'].includes(item.status) ? 'Chat Status' : 'Chat'}</Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FarmerConsultationsPage;
