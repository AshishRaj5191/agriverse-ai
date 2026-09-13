import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getToken } from '../utils/auth';

function AdminDashboardPage() {
  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalFarmers: 0,
    totalExperts: 0,
    totalBuyers: 0,
    pendingExpertVerifications: 0,
    marketplaceListings: 0,
  });

  useEffect(() => {
    async function fetchSummary() {
      try {
        const token = getToken();
        const usersResponse = await api.get('/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const users = usersResponse?.data?.data || [];

        setSummary({
          totalUsers: users.length,
          totalFarmers: users.filter((user) => user.role === 'farmer').length,
          totalExperts: users.filter((user) => user.role === 'expert').length,
          totalBuyers: users.filter((user) => user.role === 'buyer').length,
          pendingExpertVerifications: users.filter((user) => user.role === 'expert').length,
          marketplaceListings: 0,
        });
      } catch (error) {
        console.error('Admin summary fetch failed:', error);
      }
    }

    fetchSummary();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Monitor users, expert verification, and platform activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          ['Total Users', summary.totalUsers, 'Registered account count'],
          ['Total Farmers', summary.totalFarmers, 'Farmer users'],
          ['Total Experts', summary.totalExperts, 'Expert accounts'],
          ['Total Buyers', summary.totalBuyers, 'Buyer accounts'],
          ['Pending Expert Verifications', summary.pendingExpertVerifications, 'Awaiting review'],
          ['Marketplace Listings', summary.marketplaceListings, 'Placeholder count'],
        ].map(([title, value, subtitle]) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{title}</p>
            <div className="mt-2 text-3xl font-bold text-slate-900">{value}</div>
            <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Management</h2>
          <div className="mt-4 space-y-2">
            <Link to="/admin/users" className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Users Management
            </Link>
            <Link to="/admin/experts" className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Experts Management
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Quick Notes</h2>
          <ul className="mt-4 list-disc pl-5 text-sm text-slate-700">
            <li>Role-based access control is enforced on protected routes.</li>
            <li>Expert verification status is prepared for upcoming admin review workflow.</li>
            <li>Marketplace CRUD remains pending and is intentionally not implemented.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
