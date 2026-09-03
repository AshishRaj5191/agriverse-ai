import { Link, useNavigate } from 'react-router-dom';
import { clearAuthSession, getUserRole } from '../utils/auth';

function RoleDashboard({ role, title, summaryCards = [], quickLinks = [], profileLink = '', details = [] }) {
  const navigate = useNavigate();
  const userRole = getUserRole();

  const handleLogout = () => {
    clearAuthSession();
    navigate('/login', { replace: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-leaf">{role} portal</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          {profileLink ? (
            <Link to={profileLink} className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white">
              View Profile
            </Link>
          ) : null}
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.title}</p>
            <div className="mt-2 text-3xl font-bold text-slate-900">{card.value}</div>
            <p className="mt-1 text-sm text-slate-600">{card.subtitle}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Quick access</h2>
          <div className="space-y-2">
            {quickLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="block rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </aside>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Overview</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {details.map((detail) => (
                <div key={detail.label} className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">{detail.label}</p>
                  <p className="mt-1 font-semibold text-slate-800">{detail.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Status</h2>
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              {userRole ? `Signed in as ${userRole}.` : 'Authentication status unknown.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleDashboard;
