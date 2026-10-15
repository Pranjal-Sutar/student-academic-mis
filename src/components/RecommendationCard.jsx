// ============================================================
// RecommendationCard.jsx  –  Single recommendation item
// ============================================================
import { AlertCircle, Clock, TrendingDown, CheckCircle } from 'lucide-react';

const TYPE_CONFIG = {
  danger:    { border: 'border-red-300',    bg: 'bg-red-50',     icon: AlertCircle,  iconColor: 'text-red-500' },
  warning:   { border: 'border-amber-300',  bg: 'bg-amber-50',   icon: Clock,        iconColor: 'text-amber-500' },
  attention: { border: 'border-orange-300', bg: 'bg-orange-50',  icon: TrendingDown, iconColor: 'text-orange-500' },
  success:   { border: 'border-emerald-300',bg: 'bg-emerald-50', icon: CheckCircle,  iconColor: 'text-emerald-500' },
};

export default function RecommendationCard({ rec }) {
  const { border, bg, icon: Icon, iconColor } = TYPE_CONFIG[rec.type] ?? TYPE_CONFIG.warning;
  return (
    <div className={`flex gap-3 p-4 rounded-xl border ${border} ${bg}`}>
      <Icon size={18} className={`${iconColor} flex-shrink-0 mt-0.5`} />
      <div>
        <p className="text-sm font-semibold text-slate-800">{rec.title}</p>
        <p className="text-xs text-slate-600 mt-0.5">{rec.detail}</p>
      </div>
    </div>
  );
}
