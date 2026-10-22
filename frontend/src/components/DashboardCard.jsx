function DashboardCard({ title, value, subtitle, accent = 'bg-leaf' }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`mb-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold text-white ${accent}`}>
        {title}
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
    </div>
  );
}

export default DashboardCard;
