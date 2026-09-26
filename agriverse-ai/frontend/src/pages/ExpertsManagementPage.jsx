import { useEffect, useState } from 'react';
import api, { updateExpertVerification } from '../services/api';
import { getToken } from '../utils/auth';

function ExpertsManagementPage() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchExperts() {
      try {
        const token = getToken();
        const response = await api.get('/admin/experts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExperts(response?.data?.data || []);
      } catch (error) {
        setError(error?.response?.data?.message || 'Failed to load expert profiles.');
      } finally {
        setLoading(false);
      }
    }

    fetchExperts();
  }, []);

  async function changeVerification(expertId, verificationStatus) {
    setActionId(expertId);
    setError('');
    try {
      await updateExpertVerification(expertId, verificationStatus);
      setExperts((current) => current.map((expert) => (
        expert.id === expertId ? { ...expert, verificationStatus } : expert
      )));
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to update verification status.');
    } finally {
      setActionId('');
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Experts Management</h1>
      <p className="mt-1 text-sm text-slate-600">Review expert profiles and verification status.</p>
      {error ? <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      {loading ? (
        <div className="mt-6 text-slate-600">Loading experts...</div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                <th className="px-3 py-3 font-semibold">Name</th>
                <th className="px-3 py-3 font-semibold">Email</th>
                <th className="px-3 py-3 font-semibold">Specialization</th>
                <th className="px-3 py-3 font-semibold">Location</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {experts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-3 py-6 text-center text-slate-500">
                    No expert profiles available.
                  </td>
                </tr>
              ) : (
                experts.map((expert) => (
                  <tr key={expert.id} className="border-b border-slate-100">
                    <td className="px-3 py-3">{expert.name}</td>
                    <td className="px-3 py-3">{expert.email}</td>
                    <td className="px-3 py-3">{expert.specialization || 'Not specified'}</td>
                    <td className="px-3 py-3">{expert.district && expert.state ? `${expert.district}, ${expert.state}` : 'Not specified'}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                        expert.verificationStatus === 'verified'
                          ? 'bg-green-100 text-green-700'
                          : expert.verificationStatus === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {expert.verificationStatus || 'pending'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        {expert.verificationStatus !== 'verified' ? (
                          <button type="button" disabled={actionId === expert.id} onClick={() => changeVerification(expert.id, 'verified')} className="rounded-md bg-green-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-60">Approve</button>
                        ) : null}
                        {expert.verificationStatus !== 'rejected' ? (
                          <button type="button" disabled={actionId === expert.id} onClick={() => changeVerification(expert.id, 'rejected')} className="rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-60">Reject</button>
                        ) : null}
                        {expert.verificationStatus !== 'pending' ? (
                          <button type="button" disabled={actionId === expert.id} onClick={() => changeVerification(expert.id, 'pending')} className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 disabled:opacity-60">Pending</button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ExpertsManagementPage;
