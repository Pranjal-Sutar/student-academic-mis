// ============================================================
// Sidebar.jsx  –  Navigation sidebar with name editing
// ============================================================
import { useState } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  BarChart2,
  FileText,
  RotateCcw,
  GraduationCap,
  X,
  Pencil,
  Check,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',           Icon: LayoutDashboard },
  { id: 'assignments',  label: 'Assignments & Exams', Icon: ClipboardList },
  { id: 'performance',  label: 'Performance',          Icon: BarChart2 },
  { id: 'reports',      label: 'Reports',              Icon: FileText },
];

export default function Sidebar({
  activePage, onNavigate, onResetData,
  isOpen, onClose,
  studentName, onUpdateName,
}) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(studentName || '');

  const saveName = () => {
    const trimmed = nameInput.trim();
    onUpdateName(trimmed || 'Student');
    setEditingName(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') saveName();
    if (e.key === 'Escape') { setNameInput(studentName); setEditingName(false); }
  };

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 flex-shrink-0 flex flex-col
        bg-gradient-to-b from-blue-900 to-blue-800
        shadow-xl
        transform transition-transform duration-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
    >
      {/* Logo / Brand */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 rounded-xl p-2">
            <GraduationCap className="text-white" size={22} />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Student</p>
            <p className="text-blue-300 text-xs leading-tight">Academic MIS</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-blue-300 hover:text-white p-1"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      {/* Student Name */}
      <div className="mx-5 mb-4 bg-blue-700/40 rounded-xl px-3 py-2.5">
        {editingName ? (
          <div className="flex items-center gap-2">
            <input
              id="inp-student-name"
              autoFocus
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={40}
              className="flex-1 bg-white/10 text-white text-sm rounded-lg px-2 py-1 border border-white/20 focus:outline-none focus:border-white/60"
              placeholder="Enter your name"
            />
            <button
              id="btn-save-name"
              onClick={saveName}
              className="text-emerald-300 hover:text-emerald-200 p-1"
              title="Save name"
            >
              <Check size={16} />
            </button>
            <button
              onClick={() => { setNameInput(studentName); setEditingName(false); }}
              className="text-blue-300 hover:text-white p-1"
              title="Cancel"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-xs">Logged in as</p>
              <p className="text-white text-sm font-semibold truncate max-w-[130px]">
                {studentName || 'Student'}
              </p>
            </div>
            <button
              id="btn-edit-name"
              onClick={() => { setNameInput(studentName); setEditingName(true); }}
              className="text-blue-300 hover:text-white p-1 rounded"
              title="Edit name"
            >
              <Pencil size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-blue-700 mb-4" />

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = activePage === id;
          return (
            <button
              key={id}
              id={`nav-${id}`}
              onClick={() => onNavigate(id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-colors duration-150
                ${active
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <Icon size={18} className={active ? 'text-white' : 'text-blue-300'} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Reset data */}
      <div className="px-3 pb-6">
        <div className="border-t border-blue-700 pt-4">
          <button
            id="btn-reset-data"
            onClick={onResetData}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-blue-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <RotateCcw size={16} />
            Reset Demo Data
          </button>
          <p className="text-blue-400 text-xs mt-3 px-3">MIS Activity Prototype</p>
          <p className="text-blue-500 text-xs px-3">Data stored in LocalStorage</p>
        </div>
      </div>
    </aside>
  );
}
