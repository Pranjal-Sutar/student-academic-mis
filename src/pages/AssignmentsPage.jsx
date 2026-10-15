// ============================================================
// AssignmentsPage.jsx  –  Assignments + Exams (full CRUD)
// ============================================================
import { useState, useMemo } from 'react';
import { Plus, Trash2, Check, Filter, Pencil, X } from 'lucide-react';
import StatusBadge from '../components/StatusBadge.jsx';
import { PRIORITIES } from '../data/sampleData.js';
import { isOverdue, formatDate, dateDiffInDays, today } from '../utils/computeStats.js';

// ---- Reusable form field helpers ----------------------------
function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function TextInput({ id, value, onChange, placeholder, className = '' }) {
  return (
    <input
      id={id} type="text" value={value} onChange={onChange} placeholder={placeholder}
      className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white ${className}`}
    />
  );
}

function DateInput({ id, value, onChange }) {
  return (
    <input
      id={id} type="date" value={value} onChange={onChange}
      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
    />
  );
}

function SelectInput({ id, value, onChange, options }) {
  return (
    <select
      id={id} value={value} onChange={onChange}
      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ---- Assignment Form (Add / Edit) ---------------------------
function AssignmentForm({ initial, subjects, onSave, onCancel, mode = 'add' }) {
  const blank = {
    title: '', subject: subjects[0]?.id ?? '', description: '',
    assignedDate: today(), dueDate: '', priority: 'Medium', status: 'pending',
  };
  const [form, setForm] = useState(initial ?? blank);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title.trim())   e.title    = 'Title is required';
    if (!form.dueDate)        e.dueDate  = 'Due date is required';
    if (!form.subject)        e.subject  = 'Subject is required';
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({ ...form, title: form.title.trim(), description: form.description.trim() });
  };

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => ({ ...e, [field]: undefined }));
  };

  const subjectOptions = subjects.map(s => ({ value: s.id, label: s.name }));
  const priorityOptions = PRIORITIES.map(p => ({ value: p, label: p }));
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <form onSubmit={handleSubmit} noValidate className="card border-blue-200 bg-blue-50/30">
      <h3 className="font-semibold text-slate-800 mb-4">
        {mode === 'edit' ? 'Edit Assignment' : 'Add New Assignment'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Title *" error={errors.title} className="sm:col-span-2">
          <TextInput id="inp-title" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Python: Recursion Problems" />
        </Field>

        <Field label="Subject *" error={errors.subject}>
          <SelectInput id="inp-subject" value={form.subject} onChange={e => set('subject', e.target.value)} options={subjectOptions} />
        </Field>

        <Field label="Priority">
          <SelectInput id="inp-priority" value={form.priority} onChange={e => set('priority', e.target.value)} options={priorityOptions} />
        </Field>

        <Field label="Assigned Date">
          <DateInput id="inp-assigned-date" value={form.assignedDate} onChange={e => set('assignedDate', e.target.value)} />
        </Field>

        <Field label="Due Date *" error={errors.dueDate}>
          <DateInput id="inp-duedate" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
        </Field>

        <Field label="Status">
          <SelectInput id="inp-status" value={form.status} onChange={e => set('status', e.target.value)} options={statusOptions} />
        </Field>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="inp-desc">Description (optional)</label>
          <textarea
            id="inp-desc" value={form.description}
            onChange={e => set('description', e.target.value)}
            rows={2} placeholder="Brief description..."
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          id={mode === 'edit' ? 'btn-update-assignment' : 'btn-submit-assignment'}
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2"
        >
          {mode === 'edit' ? <><Pencil size={15} /> Update</> : <><Plus size={16} /> Add Assignment</>}
        </button>
        <button type="button" onClick={onCancel}
          className="text-slate-600 text-sm font-medium px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ---- Assignments Table with inline edit ---------------------
function AssignmentsTable({ assignments, subjects, onUpdate, onDelete, onEdit }) {
  if (assignments.length === 0) {
    return <p className="text-center text-slate-400 py-10 text-sm">No assignments found.</p>;
  }

  const priorityColor = {
    High: 'bg-red-100 text-red-700 border-red-200',
    Medium: 'bg-amber-100 text-amber-700 border-amber-200',
    Low: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-100">
            <th className="text-left py-3 pr-3">Title</th>
            <th className="text-left py-3 pr-3">Subject</th>
            <th className="text-left py-3 pr-3">Priority</th>
            <th className="text-left py-3 pr-3">Due Date</th>
            <th className="text-left py-3 pr-3">Status</th>
            <th className="text-left py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {assignments.map(a => {
            const overdue = isOverdue(a.dueDate, a.status);
            const diff = dateDiffInDays(today(), a.dueDate);
            const subName = subjects.find(s => s.id === a.subject)?.name ?? a.subject;
            return (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="py-3 pr-3">
                  <p className="font-medium text-slate-800">{a.title}</p>
                  {a.description && (
                    <p className="text-xs text-slate-400 mt-0.5 max-w-xs truncate">{a.description}</p>
                  )}
                </td>
                <td className="py-3 pr-3 text-slate-600 whitespace-nowrap text-xs">{subName}</td>
                <td className="py-3 pr-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${priorityColor[a.priority] ?? priorityColor.Low}`}>
                    {a.priority ?? 'Medium'}
                  </span>
                </td>
                <td className="py-3 pr-3 whitespace-nowrap">
                  <p className="text-slate-600 text-xs">{formatDate(a.dueDate)}</p>
                  {a.status !== 'completed' && (
                    <p className={`text-xs mt-0.5 ${overdue ? 'text-red-500 font-medium' : diff <= 3 ? 'text-amber-600' : 'text-slate-400'}`}>
                      {overdue ? `${Math.abs(diff)}d overdue` : diff === 0 ? 'Due today' : `${diff}d left`}
                    </p>
                  )}
                </td>
                <td className="py-3 pr-3">
                  <StatusBadge status={overdue ? 'overdue' : a.status} />
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-1.5">
                    {a.status !== 'completed' && (
                      <button
                        id={`btn-complete-${a.id}`}
                        onClick={() => onUpdate(a.id, { status: 'completed' })}
                        title="Mark as completed"
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      >
                        <Check size={13} />
                      </button>
                    )}
                    <button
                      id={`btn-edit-asgn-${a.id}`}
                      onClick={() => onEdit(a)}
                      title="Edit"
                      className="p-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      id={`btn-delete-${a.id}`}
                      onClick={() => onDelete(a.id)}
                      title="Delete"
                      className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---- Exam Form (Add) ----------------------------------------
function ExamForm({ subjects, onSave, onCancel, initial, mode = 'add' }) {
  const blank = { title: '', subject: subjects[0]?.id ?? '', date: '', time: '', venue: '', maxMarks: '' };
  const [form, setForm] = useState(initial ?? blank);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.date)         e.date  = 'Date is required';
    if (!form.subject)      e.subject = 'Subject is required';
    const mx = Number(form.maxMarks);
    if (!form.maxMarks || isNaN(mx) || mx <= 0) e.maxMarks = 'Enter valid max marks';
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({ ...form, maxMarks: Number(form.maxMarks), title: form.title.trim(), venue: form.venue.trim() });
  };

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => ({ ...e, [field]: undefined }));
  };

  const subjectOptions = subjects.map(s => ({ value: s.id, label: s.name }));

  return (
    <form onSubmit={handleSubmit} noValidate className="card border-violet-200 bg-violet-50/30">
      <h3 className="font-semibold text-slate-800 mb-4">
        {mode === 'edit' ? 'Edit Examination' : 'Add Examination'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Field label="Examination Name *" error={errors.title}>
            <TextInput id="exam-title" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Python TT1" />
          </Field>
        </div>
        <Field label="Subject *" error={errors.subject}>
          <SelectInput id="exam-subject" value={form.subject} onChange={e => set('subject', e.target.value)} options={subjectOptions} />
        </Field>
        <Field label="Max Marks *" error={errors.maxMarks}>
          <input
            id="exam-maxmarks" type="number" value={form.maxMarks} min="1"
            onChange={e => set('maxMarks', e.target.value)} placeholder="e.g. 15"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
          />
        </Field>
        <Field label="Date *" error={errors.date}>
          <DateInput id="exam-date" value={form.date} onChange={e => set('date', e.target.value)} />
        </Field>
        <Field label="Time">
          <TextInput id="exam-time" value={form.time} onChange={e => set('time', e.target.value)} placeholder="e.g. 10:00 AM" />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Venue">
            <TextInput id="exam-venue" value={form.venue} onChange={e => set('venue', e.target.value)} placeholder="e.g. Hall A – Room 101" />
          </Field>
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <button
          id={mode === 'edit' ? 'btn-update-exam' : 'btn-submit-exam'}
          type="submit"
          className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2"
        >
          {mode === 'edit' ? <><Pencil size={15} /> Update</> : <><Plus size={16} /> Add Examination</>}
        </button>
        <button type="button" onClick={onCancel}
          className="text-slate-600 text-sm font-medium px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ---- Exams Table with Edit/Delete --------------------------
function ExamsTable({ exams, subjects, onEdit, onDelete }) {
  if (exams.length === 0) {
    return <p className="text-center text-slate-400 py-6 text-sm">No exams scheduled.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-100">
            <th className="text-left py-3 pr-3">Examination</th>
            <th className="text-left py-3 pr-3">Subject</th>
            <th className="text-left py-3 pr-3">Date & Time</th>
            <th className="text-left py-3 pr-3">Max Marks</th>
            <th className="text-left py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {exams.map(e => {
            const subName = subjects.find(s => s.id === e.subject)?.name ?? e.subject;
            const diff = dateDiffInDays(today(), e.date);
            return (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="py-3 pr-3">
                  <p className="font-medium text-slate-800">{e.title}</p>
                  {e.venue && <p className="text-xs text-slate-400 mt-0.5">{e.venue}</p>}
                </td>
                <td className="py-3 pr-3 text-slate-600 text-xs">{subName}</td>
                <td className="py-3 pr-3 whitespace-nowrap">
                  <p className="text-slate-600 text-xs">{formatDate(e.date)}</p>
                  <p className="text-xs text-slate-400">{e.time} {diff >= 0 ? `· in ${diff}d` : '· Past'}</p>
                </td>
                <td className="py-3 pr-3 text-slate-600">{e.maxMarks}</td>
                <td className="py-3">
                  <div className="flex gap-1.5">
                    <button onClick={() => onEdit(e)} title="Edit"
                      className="p-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => onDelete(e.id)} title="Delete"
                      className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---- Main page component ------------------------------------
export default function AssignmentsPage({
  assignments, exams, subjects,
  onAdd, onUpdate, onDelete,
  onAddExam, onUpdateExam, onDeleteExam,
}) {
  const [tab, setTab] = useState('assignments');
  const [showForm, setShowForm] = useState(false);
  const [editingAsgn, setEditingAsgn] = useState(null);
  const [showExamForm, setShowExamForm] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus]   = useState('all');

  // Assignment filtering + sorting
  const filtered = useMemo(() => {
    return assignments.filter(a => {
      const subMatch = filterSubject === 'all' || a.subject === filterSubject;
      let statusMatch = true;
      if (filterStatus === 'pending')   statusMatch = a.status === 'pending' && !isOverdue(a.dueDate, a.status);
      if (filterStatus === 'completed') statusMatch = a.status === 'completed';
      if (filterStatus === 'overdue')   statusMatch = isOverdue(a.dueDate, a.status);
      return subMatch && statusMatch;
    });
  }, [assignments, filterSubject, filterStatus]);

  const sortedFiltered = useMemo(() =>
    [...filtered].sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
  [filtered]);

  const sortedExams = useMemo(() =>
    [...exams].sort((a, b) => a.date.localeCompare(b.date)),
  [exams]);

  const handleSaveAsgn = (data) => {
    if (editingAsgn) {
      onUpdate(editingAsgn.id, data);
      setEditingAsgn(null);
    } else {
      onAdd(data);
    }
    setShowForm(false);
  };

  const handleEditAsgn = (a) => {
    setEditingAsgn(a);
    setShowForm(true);
  };

  const handleSaveExam = (data) => {
    if (editingExam) {
      onUpdateExam(editingExam.id, data);
      setEditingExam(null);
    } else {
      onAddExam(data);
    }
    setShowExamForm(false);
  };

  const handleEditExam = (e) => {
    setEditingExam(e);
    setShowExamForm(true);
  };

  const subjectOptions = [{ value: 'all', label: 'All Subjects' }, ...subjects.map(s => ({ value: s.id, label: s.name }))];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Assignments & Exams</h1>
          <p className="text-slate-500 text-sm mt-1">Manage all academic tasks and examination schedules</p>
        </div>
        <div className="flex gap-2">
          {tab === 'assignments' && !showForm && (
            <button
              id="btn-add-assignment"
              onClick={() => { setEditingAsgn(null); setShowForm(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm"
            >
              <Plus size={16} /> Add Assignment
            </button>
          )}
          {tab === 'exams' && !showExamForm && (
            <button
              id="btn-add-exam"
              onClick={() => { setEditingExam(null); setShowExamForm(true); }}
              className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm"
            >
              <Plus size={16} /> Add Examination
            </button>
          )}
        </div>
      </div>

      {/* Forms */}
      {showForm && tab === 'assignments' && (
        <AssignmentForm
          initial={editingAsgn}
          subjects={subjects}
          mode={editingAsgn ? 'edit' : 'add'}
          onSave={handleSaveAsgn}
          onCancel={() => { setShowForm(false); setEditingAsgn(null); }}
        />
      )}
      {showExamForm && tab === 'exams' && (
        <ExamForm
          initial={editingExam}
          subjects={subjects}
          mode={editingExam ? 'edit' : 'add'}
          onSave={handleSaveExam}
          onCancel={() => { setShowExamForm(false); setEditingExam(null); }}
        />
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {['assignments', 'exams'].map(t => (
          <button
            key={t} id={`tab-${t}`} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'assignments' ? `Assignments (${assignments.length})` : `Exams (${exams.length})`}
          </button>
        ))}
      </div>

      {tab === 'assignments' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <Filter size={14} className="text-slate-400" />
            <select
              id="filter-subject" value={filterSubject}
              onChange={e => setFilterSubject(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white text-slate-600"
            >
              {subjectOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select
              id="filter-status" value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white text-slate-600"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
            <span className="text-xs text-slate-400">{sortedFiltered.length} result{sortedFiltered.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="card">
            <AssignmentsTable
              assignments={sortedFiltered}
              subjects={subjects}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onEdit={handleEditAsgn}
            />
          </div>
        </>
      )}

      {tab === 'exams' && (
        <div className="card">
          <ExamsTable
            exams={sortedExams}
            subjects={subjects}
            onEdit={handleEditExam}
            onDelete={onDeleteExam}
          />
        </div>
      )}
    </div>
  );
}
