import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFarmRecords } from '../../services/api';

function FarmRecordsListPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchRecords();
  }, [skip]);

  async function fetchRecords() {
    setLoading(true);
    setError('');

    try {
      const result = await getFarmRecords(skip, limit);
      setRecords(result.data?.records || []);
      setTotal(result.data?.pagination?.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch farm records.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Farm Records</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your crop records, planting dates, and farming activities.
          </p>
        </div>
        <Link
          to="/farmer/farm-records/add"
          className="rounded-md bg-leaf px-5 py-2.5 font-semibold text-white hover:bg-green-700"
        >
          + Add Record
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600">Loading farm records...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <p className="mb-4 text-slate-600">No farm records found.</p>
          <Link
            to="/farmer/farm-records/add"
            className="inline-block rounded-md bg-leaf px-4 py-2 font-semibold text-white hover:bg-green-700"
          >
            Create Your First Record
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <Link
              key={record._id}
              to={`/farmer/farm-records/${record._id}`}
              className="block rounded-lg border border-slate-200 bg-white p-5 hover:border-leaf hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {record.crop}
                    {record.cropVariety && ` (${record.cropVariety})`}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Sown: {new Date(record.sowingDate).toLocaleDateString()}
                    {record.expectedHarvestDate && (
                      <>
                        {' '}
                        • Expected Harvest:{' '}
                        {new Date(record.expectedHarvestDate).toLocaleDateString()}
                      </>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {record.images?.length || 0} image(s) •{' '}
                    {record.farmingActivities?.length || 0} activit(ies)
                  </p>
                </div>
                <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                  Active
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {total > limit && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <button
            onClick={() => setSkip(Math.max(0, skip - limit))}
            disabled={skip === 0}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            ← Previous
          </button>
          <span className="text-sm text-slate-600">
            Showing {skip + 1} to {Math.min(skip + limit, total)} of {total}
          </span>
          <button
            onClick={() => setSkip(skip + limit)}
            disabled={skip + limit >= total}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default FarmRecordsListPage;
