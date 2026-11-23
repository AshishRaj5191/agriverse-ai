import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  clearAuthSession,
  getUserRole,
  isAuthenticated,
} from '../utils/auth';

function navClass({ isActive }) {
  return `rounded-lg px-3 py-2 text-sm font-bold transition ${
    isActive
      ? 'bg-emerald-700 text-white shadow-sm'
      : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
  }`;
}

function Navbar() {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const role = getUserRole();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardPath = role ? `/${role}/dashboard` : '/login';
  const profilePath = role ? `/${role}/profile` : '/login';

  function handleLogout() {
    clearAuthSession();
    setMobileOpen(false);
    navigate('/login');
  }

  const primaryLinks = [
    { label: 'Home', to: '/' },
    { label: 'Features', to: '#features' },
    { label: 'About', to: '#about' },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-emerald-100/70 bg-[#f8faf7]/90 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <NavLink to="/" className="flex items-center gap-3 text-lg font-black tracking-tight text-slate-950">
            <span className="flex h-10 w-10 items-center justify-center rounded-[0.85rem] bg-emerald-700 text-sm font-black text-white shadow-[0_8px_20px_rgba(4,120,87,0.20)]">
              AV
            </span>
            <span>AgriVerse <span className="text-emerald-700">AI</span></span>
          </NavLink>

          <nav className="hidden items-center gap-2 md:flex">
            {primaryLinks.map((link) => (
              <a key={link.label} href={link.to} className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900">
                {link.label}
              </a>
            ))}

            {!authenticated ? (
              <>
                <NavLink to="/login" className={navClass}>
                  Login
                </NavLink>
                <NavLink to="/register" className={navClass}>
                  Register
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to={dashboardPath} className={navClass}>
                  Dashboard
                </NavLink>
                {role === 'farmer' ? <NavLink to="/farmer/voice-assistant" className={navClass}>Voice Assistant</NavLink> : null}
                {role === 'farmer' || role === 'buyer' ? <NavLink to={`/${role}/marketplace`} className={navClass}>Marketplace</NavLink> : null}
                {role === 'farmer' || role === 'buyer' ? <NavLink to={`/${role}/messages`} className={navClass}>Messages</NavLink> : null}
                {role === 'farmer' ? <NavLink to="/farmer/notifications" className={navClass}>Notifications</NavLink> : null}
                {role !== 'farmer' ? (
                  <NavLink to={profilePath} className={navClass}>
                    Profile
                  </NavLink>
                ) : null}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-red-50 hover:text-red-600"
                >
                  Logout
                </button>
              </>
            )}
          </nav>

          <button
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen((value) => !value)}
            className="inline-flex items-center justify-center rounded-md border border-slate-200 p-2 text-slate-700 md:hidden"
          >
            <span className="sr-only">Open menu</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
              <path d="M4 7h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
            </svg>
          </button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-slate-200 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {primaryLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                >
                  {link.label}
                </a>
              ))}

              {!authenticated ? (
                <>
                  <NavLink to="/login" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900">
                    Login
                  </NavLink>
                  <NavLink to="/register" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900">
                    Register
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink to={dashboardPath} onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900">
                    Dashboard
                  </NavLink>
                  {role === 'farmer' ? <NavLink to="/farmer/voice-assistant" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900">Voice Assistant</NavLink> : null}
                  {role === 'farmer' || role === 'buyer' ? <NavLink to={`/${role}/marketplace`} onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900">Marketplace</NavLink> : null}
                  {role === 'farmer' || role === 'buyer' ? <NavLink to={`/${role}/messages`} onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900">Messages</NavLink> : null}
                  {role === 'farmer' ? <NavLink to="/farmer/notifications" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900">Notifications</NavLink> : null}
                  {role !== 'farmer' ? (
                    <NavLink to={profilePath} onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900">
                      Profile
                    </NavLink>
                  ) : null}
                  <button type="button" onClick={handleLogout} className="rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600">
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

export default Navbar;