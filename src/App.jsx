// ============================================================
// App.jsx  –  Root component: global state + routing
// ============================================================
import { useState, useCallback } from 'react';
import {
  buildSampleAssignments,
  buildSampleExams,
  buildSampleSubjectMarks,
  DEFAULT_SUBJECTS,
} from './data/sampleData.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AssignmentsPage from './pages/AssignmentsPage.jsx';
import PerformancePage from './pages/PerformancePage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Persisted state in localStorage
  const [studentName, setStudentName] = useLocalStorage('mis_student_name', 'Pranjal');
  const [subjects, setSubjects]       = useLocalStorage('mis_subjects', DEFAULT_SUBJECTS);
  const [assignments, setAssignments] = useLocalStorage('mis_assignments', buildSampleAssignments());
  const [exams, setExams]             = useLocalStorage('mis_exams', buildSampleExams());
  // subjectMarks: array of { id, subject, tt1, tt2, tt3, see } — one per subject
  const [subjectMarks, setSubjectMarks] = useLocalStorage('mis_subject_marks', buildSampleSubjectMarks());

  // Reset all data to sample
  const handleResetData = useCallback(() => {
    if (window.confirm('Reset all data to the original sample data? This cannot be undone.')) {
      setSubjects(DEFAULT_SUBJECTS);
      setAssignments(buildSampleAssignments());
      setExams(buildSampleExams());
      setSubjectMarks(buildSampleSubjectMarks());
    }
  }, [setSubjects, setAssignments, setExams, setSubjectMarks]);

  // ---- Subject CRUD ------------------------------------------
  const addSubject = useCallback((sub) => {
    setSubjects(prev => [...prev, { ...sub, id: `sub-${Date.now()}` }]);
  }, [setSubjects]);

  const deleteSubject = useCallback((id) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    // remove its marks record too
    setSubjectMarks(prev => prev.filter(m => m.subject !== id));
  }, [setSubjects, setSubjectMarks]);

  // ---- Assignment CRUD ----------------------------------------
  const addAssignment = useCallback((asgn) => {
    setAssignments(prev => [...prev, { ...asgn, id: `asgn-${Date.now()}` }]);
  }, [setAssignments]);

  const updateAssignment = useCallback((id, patch) => {
    setAssignments(prev => prev.map(a => (a.id === id ? { ...a, ...patch } : a)));
  }, [setAssignments]);

  const deleteAssignment = useCallback((id) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
  }, [setAssignments]);

  // ---- Exam CRUD ----------------------------------------------
  const addExam = useCallback((exam) => {
    setExams(prev => [...prev, { ...exam, id: `exam-${Date.now()}` }]);
  }, [setExams]);

  const updateExam = useCallback((id, patch) => {
    setExams(prev => prev.map(e => (e.id === id ? { ...e, ...patch } : e)));
  }, [setExams]);

  const deleteExam = useCallback((id) => {
    setExams(prev => prev.filter(e => e.id !== id));
  }, [setExams]);

  // ---- Subject Marks CRUD ------------------------------------
  // Updates (or creates) the marks record for a subject
  const upsertSubjectMark = useCallback((subjectId, field, value) => {
    setSubjectMarks(prev => {
      const existing = prev.find(m => m.subject === subjectId);
      if (existing) {
        return prev.map(m =>
          m.subject === subjectId ? { ...m, [field]: value === '' ? null : Number(value) } : m
        );
      }
      // Create new record
      return [...prev, {
        id: `sm-${subjectId}-${Date.now()}`,
        subject: subjectId,
        tt1: null, tt2: null, tt3: null, see: null,
        [field]: value === '' ? null : Number(value),
      }];
    });
  }, [setSubjectMarks]);

  // Page renderer
  const renderPage = () => {
    const commonProps = { assignments, exams, subjectMarks, subjects, onResetData: handleResetData };
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard
            {...commonProps}
            studentName={studentName}
            onNavigate={setActivePage}
          />
        );
      case 'assignments':
        return (
          <AssignmentsPage
            {...commonProps}
            onAdd={addAssignment}
            onUpdate={updateAssignment}
            onDelete={deleteAssignment}
            onAddExam={addExam}
            onUpdateExam={updateExam}
            onDeleteExam={deleteExam}
          />
        );
      case 'performance':
        return (
          <PerformancePage
            subjects={subjects}
            subjectMarks={subjectMarks}
            onUpsertMark={upsertSubjectMark}
            onAddSubject={addSubject}
            onDeleteSubject={deleteSubject}
            onResetData={handleResetData}
          />
        );
      case 'reports':
        return <ReportsPage {...commonProps} />;
      default:
        return (
          <Dashboard
            {...commonProps}
            studentName={studentName}
            onNavigate={setActivePage}
          />
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={(page) => { setActivePage(page); setSidebarOpen(false); }}
        onResetData={handleResetData}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        studentName={studentName}
        onUpdateName={setStudentName}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar – mobile only */}
        <header className="lg:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
          <button
            id="sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            aria-label="Open sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-slate-800 text-sm">Student Academic MIS</span>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
