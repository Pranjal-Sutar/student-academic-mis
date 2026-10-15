// ============================================================
// Dashboard.jsx  –  Overview with personalised greeting
// ============================================================
import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  ClipboardCheck, ClipboardList, AlertTriangle, CalendarClock, TrendingUp, ArrowRight,
} from 'lucide-react';
import StatCard from '../components/StatCard.jsx';
import RecommendationCard from '../components/RecommendationCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { LOW_MARKS_THRESHOLD } from '../data/sampleData.js';
import {
  computeAssignmentStats,
  computeSubjectPerformance,
  computeOverallAverage,
  generateRecommendations,
  getUpcomingExams,
  getUpcomingDeadlines,
  isOverdue,
  formatDate,
} from '../utils/computeStats.js';

// Bar colour helper
function barColor(pct) {
  if (pct === null || pct === 0) return '#94a3b8';
  if (pct < 60) return '#ef4444';
  if (pct < 75) return '#f59e0b';
  return '#22c55e';
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3">
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      {val > 0
        ? <p className="text-lg font-bold" style={{ color: barColor(val) }}>{val}%</p>
        : <p className="text-sm text-slate-400 italic">Marks not entered</p>
      }
    </div>
  );
}

// Greeting based on time of day
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard({ assignments, exams, subjectMarks, subjects, studentName, onNavigate }) {
  const stats      = useMemo(() => computeAssignmentStats(assignments), [assignments]);
  const subPerf    = useMemo(() => computeSubjectPerformance(subjectMarks, subjects), [subjectMarks, subjects]);
  const overall    = useMemo(() => computeOverallAverage(subPerf), [subPerf]);
  const recs       = useMemo(() => generateRecommendations(assignments, subPerf), [assignments, subPerf]);
  const upcomingEx = useMemo(() => getUpcomingExams(exams, 4), [exams]);
  const deadlines  = useMemo(() => getUpcomingDeadlines(assignments, 5), [assignments]);

  const chartData = subPerf.map(s => ({
    name: s.subjectName.split(' ').slice(0, 2).join(' '),
    avg: s.isComplete ? s.percentage : 0,
    full: s.subjectName,
    incomplete: !s.isComplete,
  }));

  const displayName = studentName?.trim() || 'Student';

  return (
    <div className="space-y-6 max-w-7xl">

      {/* Personalised greeting */}
      <div className="card bg-gradient-to-r from-blue-600 to-blue-700 border-0 text-white">
        <h1 className="text-2xl font-bold">
          {getGreeting()}, {displayName}! 👋
        </h1>
        <p className="text-blue-100 text-sm mt-1">
          Stay organized, track your progress, and make every study session count.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Assignments"
          value={stats.total}
          sub="This semester"
          colorClass="text-blue-600"
          bgClass="bg-blue-50"
          icon={<ClipboardList size={20} />}
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          sub={`${stats.overdue} overdue`}
          colorClass="text-amber-600"
          bgClass="bg-amber-50"
          icon={<ClipboardCheck size={20} />}
        />
        <StatCard
          label="Upcoming Exams"
          value={getUpcomingExams(exams, 100).length}
          sub="Scheduled"
          colorClass="text-violet-600"
          bgClass="bg-violet-50"
          icon={<CalendarClock size={20} />}
        />
        <StatCard
          label="Overall Average"
          value={overall !== null ? `${overall}%` : '—'}
          sub={overall === null ? 'Enter all marks' : overall >= 60 ? 'On track' : 'Needs improvement'}
          colorClass={overall === null ? 'text-slate-400' : overall >= 60 ? 'text-emerald-600' : 'text-red-600'}
          bgClass={overall === null ? 'bg-slate-50' : overall >= 60 ? 'bg-emerald-50' : 'bg-red-50'}
          icon={<TrendingUp size={20} />}
        />
      </div>

      {/* Chart + Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Subject-wise Performance</h2>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
              Threshold: {LOW_MARKS_THRESHOLD}%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={36} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.incomplete ? '#cbd5e1' : barColor(entry.avg)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-4 mt-3 justify-center text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" />≥75%</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />60–74%</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" />&lt;60%</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-slate-300 inline-block" />Incomplete</span>
          </div>
        </div>

        {/* Recommendations */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-800">Recommendations</h2>
            <AlertTriangle size={16} className="text-amber-400" />
          </div>
          <div className="space-y-3 overflow-y-auto max-h-72">
            {recs.map(rec => <RecommendationCard key={rec.id} rec={rec} />)}
          </div>
        </div>
      </div>

      {/* Upcoming deadlines + exams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Deadlines */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Upcoming Deadlines</h2>
            <button
              id="btn-view-all-assignments"
              onClick={() => onNavigate('assignments')}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          {deadlines.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No upcoming deadlines 🎉</p>
          ) : (
            <div className="space-y-3">
              {deadlines.map(a => {
                const overdue = isOverdue(a.dueDate, a.status);
                const subName = subjects.find(s => s.id === a.subject)?.name ?? a.subject;
                return (
                  <div key={a.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{a.title}</p>
                      <p className="text-xs text-slate-400">{subName} · {formatDate(a.dueDate)}</p>
                    </div>
                    <StatusBadge status={overdue ? 'overdue' : a.status} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Exams */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Upcoming Exams</h2>
            <button
              id="btn-view-all-exams"
              onClick={() => onNavigate('assignments')}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          {upcomingEx.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No exams scheduled</p>
          ) : (
            <div className="space-y-3">
              {upcomingEx.map(e => {
                const subName = subjects.find(s => s.id === e.subject)?.name ?? e.subject;
                return (
                  <div key={e.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{e.title}</p>
                      <p className="text-xs text-slate-400">{subName} · {formatDate(e.date)}</p>
                    </div>
                    <span className="text-xs bg-violet-100 text-violet-700 border border-violet-200 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                      {e.maxMarks} marks
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
