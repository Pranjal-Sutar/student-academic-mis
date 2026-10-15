// ============================================================
// StatusBadge.jsx  –  Pill badge for assignment / task status
// ============================================================
export default function StatusBadge({ status }) {
  const map = {
    completed: { label: 'Completed', cls: 'badge-completed' },
    pending:   { label: 'Pending',   cls: 'badge-pending' },
    overdue:   { label: 'Overdue',   cls: 'badge-overdue' },
    attention: { label: 'Attention', cls: 'badge-attention' },
  };
  const { label, cls } = map[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
