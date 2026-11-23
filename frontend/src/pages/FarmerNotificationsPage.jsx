import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../services/api';

function notificationLink(notification) {
  if (notification.marketplaceConversation) return '/farmer/messages';
  if (notification.marketplaceInquiry) return '/farmer/marketplace';
  if (notification.consultation) return `/farmer/consultations/${notification.consultation}`;
  return null;
}

function notificationIcon(type = '') {
  if (type.includes('consultation')) return 'EX';
  if (type.includes('marketplace')) return 'MK';
  return 'AL';
}

function FarmerNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState('');

  async function loadNotifications() {
    try {
      setError('');
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

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.readAt).length,
    [notifications]
  );

  const visibleNotifications = useMemo(() => {
    if (filter === 'unread') return notifications.filter((notification) => !notification.readAt);
    if (filter === 'consultation') return notifications.filter((notification) => notification.type?.includes('consultation'));
    if (filter === 'marketplace') return notifications.filter((notification) => notification.type?.includes('marketplace'));
    return notifications;
  }, [filter, notifications]);

  async function markRead(id) {
    try {
      setBusyId(id);
      await markNotificationRead(id);
      setNotifications((current) => current.map((item) => (
        item._id === id ? { ...item, readAt: new Date().toISOString() } : item
      )));
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to mark notification as read.');
    } finally {
      setBusyId('');
    }
  }

  async function markAllRead() {
    if (!unreadCount) return;
    try {
      setBusyId('all');
      await markAllNotificationsRead();
      setNotifications((current) => current.map((item) => (
        item.readAt ? item : { ...item, readAt: new Date().toISOString() }
      )));
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to mark notifications as read.');
    } finally {
      setBusyId('');
    }
  }

  if (loading) return <div className="rounded-2xl border border-slate-200 bg-white p-6">Loading notifications...</div>;

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Updates</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">Farmer Notifications</h1>
            <p className="mt-2 text-sm text-slate-600">Consultation replies, expert updates, and marketplace activity.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white px-4 py-3 text-center shadow-sm">
              <p className="text-2xl font-bold text-slate-900">{unreadCount}</p>
              <p className="text-xs font-semibold text-slate-500">Unread</p>
            </div>
            <button type="button" onClick={markAllRead} disabled={!unreadCount || busyId === 'all'} className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
              {busyId === 'all' ? 'Updating...' : 'Mark all read'}
            </button>
          </div>
        </div>
      </section>

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <div className="flex flex-wrap gap-2">
        {[['all', 'All'], ['unread', 'Unread'], ['consultation', 'Consultations'], ['marketplace', 'Marketplace']].map(([value, label]) => (
          <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-full px-4 py-2 text-sm font-semibold ${filter === value ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>
            {label}
          </button>
        ))}
      </div>

      <section className="space-y-3">
        {visibleNotifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-lg font-semibold text-slate-800">{filter === 'unread' ? 'You are all caught up' : 'No notifications here yet'}</p>
            <p className="mt-2 text-sm text-slate-500">New expert replies and marketplace updates will appear here automatically.</p>
            <Link to="/farmer/experts" className="mt-5 inline-flex rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white">Find an Expert</Link>
          </div>
        ) : visibleNotifications.map((notification) => {
          const link = notificationLink(notification);
          return (
            <article key={notification._id} className={`rounded-2xl border bg-white p-5 shadow-sm ${notification.readAt ? 'border-slate-200' : 'border-emerald-300 bg-emerald-50/40'}`}>
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-xs font-bold text-white">{notificationIcon(notification.type)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold leading-6 text-slate-900">{notification.message}</p>
                    {!notification.readAt ? (
                      <button type="button" onClick={() => markRead(notification._id)} disabled={busyId === notification._id} className="shrink-0 text-sm font-semibold text-emerald-700 disabled:opacity-50">
                        {busyId === notification._id ? 'Saving...' : 'Mark read'}
                      </button>
                    ) : null}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Just now'}</p>
                  {link ? <Link to={link} className="mt-3 inline-flex rounded-lg border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">Open update →</Link> : null}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

export default FarmerNotificationsPage;
