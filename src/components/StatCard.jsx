// ============================================================
// StatCard.jsx  –  Reusable KPI card for the dashboard
// ============================================================
export default function StatCard({ label, value, sub, colorClass = 'text-blue-600', bgClass = 'bg-blue-50', icon }) {
  return (
    <div className="card flex items-start gap-4">
      {icon && (
        <div className={`${bgClass} rounded-xl p-3 flex-shrink-0`}>
          <span className={`${colorClass}`}>{icon}</span>
        </div>
      )}
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${colorClass}`}>{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
