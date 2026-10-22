import { NavLink } from 'react-router-dom';

function Sidebar({ items = [], title = 'Menu' }) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.1em] text-slate-500">{title}</h2>
      <nav className="space-y-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block rounded-xl px-3 py-2 text-sm font-medium transition ${
                isActive ? 'bg-leaf text-white' : 'text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
