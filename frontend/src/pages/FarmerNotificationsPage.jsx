import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getNotifications, markNotificationRead } from '../services/api';

function notificationLink(notification) {
  if (notification.marketplaceConversation) return '/farmer/messages';
  if (notification.marketplaceInquiry) return '/farmer/marketplace';
  if (notification.consultation) return '/farmer/consultations';
  return null;
}

function FarmerNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadNotifications() {
    try {
      const response = await getNotifications();
      setNotifications(response.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function markRead(id) {
    try {
      await markNotificationRead(id);
      setNotifications((current) => current.map((item) => (
        item._id === id ? { ...item, readAt: new Date().toISOString() } : item
      )));
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to mark notification as read.');
    }
  }

  if (loading) return <div className="rounded-2xl border border-slate-200 bg-white p-6">Loading notifications...</div>;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Farmer Notifications</h1>
        <p className="mt-1 text-sm text-slate-600">Buyer inquiries, marketplace messages, and consultation updates.</p>
      </section>
      {error ? <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
      <section className="space-y-3">
        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">No notifications yet.</div>
        ) : notifications.map((notification) => {
          const link = notificationLink(notification);
          return (
            <article key={notification._id} className={`rounded-2xl border bg-white p-4 shadow-sm ${notification.readAt ? 'border-slate-200' : 'border-emerald-300 bg-emerald-50/40'}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">{notification.message}</p>
                  <p className="mt-1 text-xs text-slate-500">{new Date(notification.createdAt).toLocaleString()}</p>
                </div>
                {!notification.readAt ? <button type="button" onClick={() => markRead(notification._id)} className="shrink-0 text-sm font-semibold text-emerald-700">Mark read</button> : null}
              </div>
              {link ? <Link to={link} className="mt-3 inline-flex text-sm font-semibold text-emerald-700 hover:underline">Open →</Link> : null}
            </article>
          );
        })}
      </section>
    </div>
  );
}

export default FarmerNotificationsPage;
