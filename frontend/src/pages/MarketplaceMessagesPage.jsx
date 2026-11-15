import { useEffect, useState } from 'react';
import { getMarketplaceConversations, getMarketplaceMessages, sendMarketplaceMessage } from '../services/api';

function MarketplaceMessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadConversations() {
    try { setConversations((await getMarketplaceConversations()).data || []); }
    catch (err) { setError(err?.response?.data?.message || 'Unable to load messages.'); }
    finally { setLoading(false); }
  }
  async function openConversation(conversation) {
    setSelected(conversation); setError('');
    try { setMessages((await getMarketplaceMessages(conversation._id)).data || []); await loadConversations(); }
    catch (err) { setError(err?.response?.data?.message || 'Unable to load conversation.'); }
  }
  useEffect(() => { loadConversations(); }, []);
  useEffect(() => {
    if (!selected) return undefined;
    const timer = window.setInterval(() => openConversation(selected), 10000);
    return () => window.clearInterval(timer);
  }, [selected]);
  async function send(event) {
    event.preventDefault();
    if (!message.trim() || !selected) return;
    try { await sendMarketplaceMessage(selected._id, message); setMessage(''); await openConversation(selected); }
    catch (err) { setError(err?.response?.data?.message || 'Unable to send message.'); }
  }
  if (loading) return <div className="rounded-2xl border border-slate-200 bg-white p-6">Loading messages...</div>;
  return <div className="grid gap-5 lg:grid-cols-[320px,1fr]">
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
      <p className="mt-1 text-sm text-slate-600">Buyer and farmer conversations stay linked to their listing.</p>
      <div className="mt-4 space-y-2">{conversations.length === 0 ? <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">No conversations yet.</p> : conversations.map((item) => <button type="button" key={item._id} onClick={() => openConversation(item)} className={`w-full rounded-xl border p-3 text-left ${selected?._id === item._id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}><p className="font-semibold">{item.listing?.name || 'Listing'}</p><p className="text-sm text-slate-600">{item.buyer?.name} · {item.seller?.name}</p><p className="mt-1 truncate text-sm text-slate-500">{item.lastMessage || 'Conversation started'}</p>{item.unreadForBuyer || item.unreadForSeller ? <span className="text-xs font-semibold text-emerald-700">Unread messages</span> : null}</button>)}</div>
    </section>
    <section className="flex min-h-[480px] flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {selected ? <><div className="border-b border-slate-200 pb-3"><h2 className="text-xl font-semibold">{selected.listing?.name || 'Listing conversation'}</h2><p className="text-sm text-slate-600">Participants: {selected.buyer?.name} and {selected.seller?.name}</p></div><div className="flex-1 space-y-3 overflow-y-auto py-4">{messages.map((item) => <div key={item._id} className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-semibold text-slate-500">{item.sender?.name || 'Participant'} · {new Date(item.createdAt).toLocaleString()}</p><p className="mt-1 whitespace-pre-wrap text-slate-800">{item.message}</p></div>)}</div><form onSubmit={send} className="flex gap-2 border-t border-slate-200 pt-3"><input required maxLength="2000" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write a message..." className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2" /><button type="submit" className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white">Send</button></form></> : <div className="m-auto text-center text-slate-600">Select a conversation to read and reply.</div>}
      {error ? <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
    </section>
  </div>;
}

export default MarketplaceMessagesPage;
