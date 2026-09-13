import { NavLink } from 'react-router-dom';

function navClass({ isActive }) {
  return `rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-leaf text-white'
      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
  }`;
}

function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <NavLink to="/" className="text-lg font-bold text-leaf">
          AgriVerse AI
        </NavLink>
        <nav className="flex items-center gap-2">
          <NavLink to="/" className={navClass}>
            Home
          </NavLink>
          <NavLink to="/login" className={navClass}>
            Login
          </NavLink>
          <NavLink to="/register" className={navClass}>
            Register
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
