import { Link } from 'react-router-dom';
import { getUserRole, isAuthenticated } from '../utils/auth';

function HomePage() {
  const authenticated = isAuthenticated();
  const role = getUserRole();

  const dashboardPath = role
    ? `/${role}/dashboard`
    : '/login';

  const profilePath = role
    ? `/${role}/profile`
    : '/login';

  return (
    <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="mb-3 inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
          MCA Major Project - AgriVerse AI
        </p>

        <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          {authenticated ? 'Welcome back to AgriVerse AI' : 'AgriVerse AI'}
        </h1>

        <p className="mt-4 text-lg text-slate-700">
          Intelligent Agriculture Ecosystem for Farmers. Connect farm records,
          AI-powered disease detection, agricultural intelligence, and future
          farming services in one platform.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {authenticated ? (
            <>
              <Link
                to={dashboardPath}
                className="rounded-md bg-leaf px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-green-700"
              >
                Go to Dashboard
              </Link>

              <Link
                to={profilePath}
                className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                View Profile
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="rounded-md bg-leaf px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-green-700"
              >
                Create Account
              </Link>

              <Link
                to="/login"
                className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-green-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">
          AgriVerse AI Ecosystem
        </h2>

        <ul className="mt-4 space-y-3 text-slate-700">
          <li>🌱 Farm and crop record management</li>
          <li>🔬 AI-powered crop disease detection</li>
          <li>🌦️ Weather and agricultural intelligence</li>
          <li>📊 Market intelligence and insights</li>
          <li>👨‍🌾 Expert consultation</li>
          <li>🛒 Farmer-to-buyer marketplace</li>
        </ul>
      </div>
    </section>
  );
}

export default HomePage;