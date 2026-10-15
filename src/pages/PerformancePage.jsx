// ============================================================
// PerformancePage.jsx  –  TT1/TT2/TT3/SEE editable marks table
//                         + Subject management
// ============================================================
import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import { Plus, Trash2, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { ASSESSMENTS, LOW_MARKS_THRESHOLD, TOTAL_MAX_MARKS } from '../data/sampleData.js';
import { computeSubjectPerformance } from '../utils/computeStats.js';

// ---- Add Subject Form ----------------------------------------
function AddSubjectForm({ onAdd, onCancel, existingCodes }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = {};
    if (!name.trim()) e.name = 'Subject name is required';
    if (!code.trim()) e.code = 'Subject code is required';
    if (existingCodes.includes(code.trim().toUpperCase())) e.code = 'Code already exists';
    if (Object.keys(e).length) { setErrors(e); return; }
    onAdd({ name: name.trim(), code: code.trim().toUpperCase() });
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="card border-blue-200 bg-blue-50/30">
      <h3 className="font-semibold text-slate-800 mb-4">Add New Subject</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="sub-name">Subject Name *</label>
          <input
            id="sub-name" type="text" value={name}
            onChange={e => { setName(e.target.value); setErrors(x => ({ ...x, name: undefined })); }}
            placeholder="e.g. Database Management"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="sub-code">Subject Code *</label>
          <input
            id="sub-code" type="text" value={code}
            onChange={e => { setCode(e.target.value); setErrors(x => ({ ...x, code: undefined })); }}
            placeholder="e.g. DBMS501"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
          />
          {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <button id="btn-add-subject" type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={16} /> Add Subject
        </button>
        <button type="button" onClick={onCancel}
          className="text-slate-600 text-sm font-medium px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ---- Custom tooltip -----------------------------------------
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  const color = val === 0 ? '#94a3b8' : val < LOW_MARKS_THRESHOLD ? '#ef4444' : val < 75 ? '#f59e0b' : '#22c55e';
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3">
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      {val > 0
        ? <p className="text-lg font-bold" style={{ color }}>{val}%</p>
        : <p className="text-sm text-slate-400 italic">Marks incomplete</p>
      }
    </div>
  );
}

// ---- Inline editable marks row ------------------------------
function MarksRow({ subPerf, onUpsert }) {
  const sm = subPerf.markRecord;

  const handleChange = (key, val, maxAllowed) => {
    const n = Number(val);
    if (val !== '' && (isNaN(n) || n < 0 || n > maxAllowed)) return;
    onUpsert(subPerf.subjectId, key, val);
  };

  return (
    <tr className={`hover:bg-slate-50 ${subPerf.needsAttention ? 'bg-red-50/30' : ''}`}>
      <td className="py-3 pr-3">
        <p className="font-medium text-slate-800 text-sm">{subPerf.subjectName}</p>
        <p className="text-xs text-slate-400">{subPerf.subjectCode}</p>
      </td>
      {ASSESSMENTS.map(a => {
        const val = sm ? (sm[a.key] !== null && sm[a.key] !== undefined ? String(sm[a.key]) : '') : '';
        const isInvalid = val !== '' && (Number(val) < 0 || Number(val) > a.maxMarks);
        return (
          <td key={a.key} className="py-2 pr-2">
            <div className="flex flex-col items-start gap-0.5">
              <input
                id={`marks-${subPerf.subjectId}-${a.key}`}
                type="number"
                value={val}
                onChange={e => handleChange(a.key, e.target.value, a.maxMarks)}
                min="0"
                max={a.maxMarks}
                placeholder="—"
                className={`w-16 border rounded-lg px-2 py-1.5 text-sm text-center bg-white
                  ${isInvalid ? 'border-red-400 bg-red-50' : 'border-slate-200'}
                  focus:outline-none focus:border-blue-400`}
              />
              <span className="text-xs text-slate-400">/ {a.maxMarks}</span>
            </div>
          </td>
        );
      })}
      {/* Total */}
      <td className="py-3 pr-3 text-center">
        {subPerf.isComplete ? (
          <div>
            <p className={`text-base font-bold ${subPerf.needsAttention ? 'text-red-600' : 'text-emerald-600'}`}>
              {subPerf.total}
            </p>
            <p className={`text-xs ${subPerf.needsAttention ? 'text-red-500' : 'text-slate-500'}`}>
              {subPerf.percentage}%
            </p>
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">Not entered</span>
        )}
      </td>
      {/* Status */}
      <td className="py-3">
        {subPerf.isComplete ? (
          subPerf.needsAttention ? (
            <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
              <AlertTriangle size={12} /> Attention
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <CheckCircle size={12} /> On track
            </span>
          )
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
            <Info size={12} /> Incomplete
          </span>
        )}
      </td>
    </tr>
  );
}

// ---- Main page ----------------------------------------------
export default function PerformancePage({ subjects, subjectMarks, onUpsertMark, onAddSubject, onDeleteSubject }) {
  const [showSubjectForm, setShowSubjectForm] = useState(false);

  const subPerf = useMemo(() => computeSubjectPerformance(subjectMarks, subjects), [subjectMarks, subjects]);

  const chartData = subPerf.map(s => ({
    name: s.subjectName.split(' ').slice(0, 2).join(' '),
    avg: s.isComplete ? s.percentage : 0,
    incomplete: !s.isComplete,
  }));

  const radarData = subPerf
    .filter(s => s.isComplete)
    .map(s => ({ subject: s.subjectName.split(' ')[0], A: s.percentage }));

  const existingCodes = subjects.map(s => (s.code || '').toUpperCase());

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Academic Performance</h1>
          <p className="text-slate-500 text-sm mt-1">
            Assessment: TT1 (15) + TT2 (15) + TT3 (10) + SEE (60) = 100 marks · Threshold: {LOW_MARKS_THRESHOLD}%
          </p>
        </div>
        {!showSubjectForm && (
          <button
            id="btn-add-subject-btn"
            onClick={() => setShowSubjectForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} /> Add Subject
          </button>
        )}
      </div>

      {showSubjectForm && (
        <AddSubjectForm
          onAdd={onAddSubject}
          onCancel={() => setShowSubjectForm(false)}
          existingCodes={existingCodes}
        />
      )}

      {/* Subject summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {subPerf.map(s => (
          <div
            key={s.subjectId}
            className={`card text-center relative group ${
              s.needsAttention ? 'border-red-200 bg-red-50/30' :
              s.isComplete ? 'border-emerald-200 bg-emerald-50/10' :
              'border-slate-200'
            }`}
          >
            <button
              onClick={() => {
                if (window.confirm(`Delete subject "${s.subjectName}"? This will also remove its marks.`)) {
                  onDeleteSubject(s.subjectId);
                }
              }}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-opacity"
              title="Delete subject"
            >
              <Trash2 size={12} />
            </button>
            <p className="text-xs font-semibold text-slate-400 mb-0.5">{s.subjectCode}</p>
            <p className="text-xs font-semibold text-slate-500 mb-1 truncate">{s.subjectName}</p>
            <p className={`text-2xl font-bold ${
              s.needsAttention ? 'text-red-600' :
              s.isComplete ? 'text-emerald-600' : 'text-slate-400'
            }`}>
              {s.isComplete ? `${s.percentage}%` : '—'}
            </p>
            {s.isComplete ? (
              <p className="text-xs text-slate-400 mt-0.5">{s.total} / {TOTAL_MAX_MARKS}</p>
            ) : (
              <p className="text-xs text-slate-400 mt-0.5 italic">Incomplete</p>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <h2 className="font-semibold text-slate-800 mb-4">Performance by Subject (% out of 100)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={38} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="avg" radius={[6, 6, 0, 0]} fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4">Performance Radar</h2>
          {radarData.length >= 3 ? (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <Radar name="Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-sm text-center py-16">
              {radarData.length === 0
                ? 'Enter marks for at least 3 subjects'
                : 'Needs ≥3 complete subjects'}
            </p>
          )}
        </div>
      </div>

      {/* Marks Entry Table */}
      <div className="card">
        <div className="mb-4">
          <h2 className="font-semibold text-slate-800">Enter / Edit Marks</h2>
          <p className="text-xs text-slate-400 mt-1">
            Type marks directly. Totals and percentages are calculated automatically when all four fields are filled.
            Marks shown as "Not entered" do not count towards the average.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-100">
                <th className="text-left py-3 pr-3 min-w-[130px]">Subject</th>
                {ASSESSMENTS.map(a => (
                  <th key={a.key} className="text-left py-3 pr-2 min-w-[80px]">
                    {a.label}
                    <span className="block text-slate-400 normal-case font-normal">/{a.maxMarks}</span>
                  </th>
                ))}
                <th className="text-center py-3 pr-3 min-w-[80px]">Total /100</th>
                <th className="text-left py-3 min-w-[90px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {subPerf.map(s => (
                <MarksRow key={s.subjectId} subPerf={s} onUpsert={onUpsertMark} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
