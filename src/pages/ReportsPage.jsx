// ============================================================
// ReportsPage.jsx  –  Academic summary report (updated for
//                     TT1/TT2/TT3/SEE assessment structure)
// ============================================================
import { useMemo } from 'react';
import { FileText, CheckCircle2, AlertTriangle, ClipboardX, BookOpen } from 'lucide-react';
import { LOW_MARKS_THRESHOLD, ASSESSMENTS, TOTAL_MAX_MARKS } from '../data/sampleData.js';
import {
  computeAssignmentStats,
  computeSubjectPerformance,
  computeOverallAverage,
  isOverdue,
  formatDate,
} from '../utils/computeStats.js';
import StatusBadge from '../components/StatusBadge.jsx';

// ---- Section wrapper ----------------------------------------
function Section({ title, icon: Icon, children }) {
  return (
    <div className="card space-y-4">
      <h2 className="flex items-center gap-2 font-semibold text-slate-800 text-base">
        <Icon size={18} className="text-blue-500" />
        {title}
      </h2>
      {children}
    </div>
  );
}

// ---- Stat row -----------------------------------------------
function StatRow({ label, value, valueClass = 'text-slate-800' }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}

export default function ReportsPage({ assignments, subjectMarks, subjects }) {
  const stats   = useMemo(() => computeAssignmentStats(assignments), [assignments]);
  const subPerf = useMemo(() => computeSubjectPerformance(subjectMarks, subjects), [subjectMarks, subjects]);
  const overall = useMemo(() => computeOverallAverage(subPerf), [subPerf]);

  const overdueList = useMemo(
    () => assignments.filter(a => isOverdue(a.dueDate, a.status)),
    [assignments]
  );
  const pendingList = useMemo(
    () => assignments.filter(a => a.status === 'pending' && !isOverdue(a.dueDate, a.status)),
    [assignments]
  );
  const lowSubjects = useMemo(
    () => subPerf.filter(s => s.needsAttention),
    [subPerf]
  );
  const incompleteSubjects = useMemo(
    () => subPerf.filter(s => !s.isComplete),
    [subPerf]
  );

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Academic Reports</h1>
        <p className="text-slate-500 text-sm mt-1">A data-driven summary of your academic standing</p>
      </div>

      {/* Assignment Summary */}
      <Section title="Assignment Summary" icon={FileText}>
        <StatRow label="Total Assignments" value={stats.total} />
        <StatRow
          label="Completed"
          value={`${stats.completed} (${stats.completionPct}%)`}
          valueClass="text-emerald-600"
        />
        <StatRow
          label="Pending (not overdue)"
          value={pendingList.length}
          valueClass="text-amber-600"
        />
        <StatRow
          label="Overdue"
          value={stats.overdue}
          valueClass={stats.overdue > 0 ? 'text-red-600' : 'text-slate-800'}
        />

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Completion Rate</span>
            <span>{stats.completionPct}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                stats.completionPct >= 75 ? 'bg-emerald-500' :
                stats.completionPct >= 50 ? 'bg-amber-400' : 'bg-red-500'
              }`}
              style={{ width: `${stats.completionPct}%` }}
            />
          </div>
        </div>
      </Section>

      {/* Subject-wise Performance */}
      <Section title="Subject-wise Marks (TT1 + TT2 + TT3 + SEE)" icon={BookOpen}>
        <div className="mb-1">
          <StatRow
            label="Overall Average"
            value={overall !== null ? `${overall}%` : 'Incomplete data'}
            valueClass={overall === null ? 'text-slate-400' : overall >= LOW_MARKS_THRESHOLD ? 'text-emerald-600' : 'text-red-600'}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-100">
                <th className="text-left py-2 pr-3">Subject</th>
                {ASSESSMENTS.map(a => (
                  <th key={a.key} className="text-center py-2 pr-3">
                    {a.label}
                    <span className="block text-slate-400 normal-case font-normal">/{a.maxMarks}</span>
                  </th>
                ))}
                <th className="text-center py-2 pr-3">Total /{TOTAL_MAX_MARKS}</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {subPerf.map(s => {
                const sm = s.markRecord;
                return (
                  <tr key={s.subjectId} className={`hover:bg-slate-50 ${s.needsAttention ? 'bg-red-50/20' : ''}`}>
                    <td className="py-2.5 pr-3">
                      <p className="font-medium text-slate-800">{s.subjectName}</p>
                      <p className="text-xs text-slate-400">{s.subjectCode}</p>
                    </td>
                    {ASSESSMENTS.map(a => (
                      <td key={a.key} className="py-2.5 pr-3 text-center text-slate-600">
                        {sm && sm[a.key] !== null && sm[a.key] !== undefined
                          ? sm[a.key]
                          : <span className="text-slate-300 italic text-xs">—</span>
                        }
                      </td>
                    ))}
                    <td className="py-2.5 pr-3 text-center">
                      {s.isComplete ? (
                        <div>
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-14 bg-slate-100 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  s.percentage >= 75 ? 'bg-green-500' :
                                  s.percentage >= 60 ? 'bg-amber-400' : 'bg-red-500'
                                }`}
                                style={{ width: `${s.percentage}%` }}
                              />
                            </div>
                            <span className={`text-xs font-semibold ${s.needsAttention ? 'text-red-600' : 'text-emerald-600'}`}>
                              {s.total} ({s.percentage}%)
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Not entered</span>
                      )}
                    </td>
                    <td className="py-2.5">
                      <StatusBadge status={
                        !s.isComplete ? 'pending' :
                        s.needsAttention ? 'attention' : 'completed'
                      } />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {incompleteSubjects.length > 0 && (
          <p className="text-xs text-slate-400 mt-2">
            ⓘ {incompleteSubjects.length} subject{incompleteSubjects.length > 1 ? 's have' : ' has'} incomplete marks.
            The overall average is calculated from complete subjects only.
          </p>
        )}
      </Section>

      {/* Subjects requiring attention */}
      {lowSubjects.length > 0 ? (
        <Section title="Subjects Requiring Attention" icon={AlertTriangle}>
          <p className="text-xs text-slate-500">
            The following subjects scored below {LOW_MARKS_THRESHOLD}% and require focused revision:
          </p>
          <div className="space-y-3">
            {lowSubjects.map(s => (
              <div key={s.subjectId} className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-200">
                <div>
                  <p className="text-sm font-semibold text-red-800">{s.subjectName}</p>
                  <p className="text-xs text-red-600 mt-0.5">
                    Total: {s.total}/{TOTAL_MAX_MARKS} ({s.percentage}%) — threshold: {LOW_MARKS_THRESHOLD}%
                  </p>
                  <p className="text-xs text-red-500 mt-0.5">
                    Missing marks needed: {Math.ceil((LOW_MARKS_THRESHOLD / 100) * TOTAL_MAX_MARKS) - s.total} more marks to reach threshold
                  </p>
                </div>
                <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        </Section>
      ) : incompleteSubjects.length === 0 ? (
        <div className="card border-emerald-200 bg-emerald-50/30 flex items-center gap-3">
          <CheckCircle2 size={24} className="text-emerald-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-emerald-800 text-sm">All subjects above threshold</p>
            <p className="text-xs text-emerald-600">No subjects require special attention at this time.</p>
          </div>
        </div>
      ) : null}

      {/* Overdue assignments */}
      {overdueList.length > 0 && (
        <Section title="Overdue Assignments" icon={ClipboardX}>
          <p className="text-xs text-slate-500">
            These assignments are past their due date and must be submitted immediately:
          </p>
          <div className="space-y-2">
            {overdueList.map(a => {
              const subName = subjects.find(s => s.id === a.subject)?.name ?? a.subject;
              return (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-200">
                  <div>
                    <p className="text-sm font-semibold text-red-800">{a.title}</p>
                    <p className="text-xs text-red-600 mt-0.5">
                      {subName} · Due: {formatDate(a.dueDate)}
                      {a.priority === 'High' && ' · High Priority'}
                    </p>
                  </div>
                  <StatusBadge status="overdue" />
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Footer note */}
      <div className="text-xs text-slate-400 text-center pb-4">
        This report is generated dynamically from your current application data.
        All statistics update automatically when you add, update, or delete records.
      </div>
    </div>
  );
}
