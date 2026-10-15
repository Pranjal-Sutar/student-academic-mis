// ============================================================
// sampleData.js  –  Sample data for the MIS prototype
// ============================================================
// Assessment structure (per subject, total = 100):
//   TT1 – 15 marks
//   TT2 – 15 marks
//   TT3 – 10 marks
//   Semester End Examination (SEE) – 60 marks
// ============================================================

// Default subject list (user can add more at runtime)
export const DEFAULT_SUBJECTS = [
  { id: 'py',  name: 'Python Programming', code: 'PY101' },
  { id: 'ds',  name: 'Data Structures',    code: 'DS201' },
  { id: 'os',  name: 'Operating Systems',  code: 'OS301' },
  { id: 'la',  name: 'Linear Algebra',     code: 'LA101' },
  { id: 'mis', name: 'MIS',                code: 'MIS401' },
];

// Assessment definitions – name and max marks
export const ASSESSMENTS = [
  { key: 'tt1', label: 'TT1',                         maxMarks: 15 },
  { key: 'tt2', label: 'TT2',                         maxMarks: 15 },
  { key: 'tt3', label: 'TT3',                         maxMarks: 10 },
  { key: 'see', label: 'Semester End Examination',    maxMarks: 60 },
];

export const TOTAL_MAX_MARKS = ASSESSMENTS.reduce((s, a) => s + a.maxMarks, 0); // 100

// Low-marks threshold (total out of 100). Flag a subject when total < this.
export const LOW_MARKS_THRESHOLD = 60;

// Priorities for assignments
export const PRIORITIES = ['High', 'Medium', 'Low'];

// ---------------------------------------------------------------
// Helper: offset a date by N days from today
// ---------------------------------------------------------------
function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

// ---------------------------------------------------------------
// ASSIGNMENTS (10 entries, mix of statuses and deadlines)
// ---------------------------------------------------------------
export function buildSampleAssignments() {
  return [
    {
      id: 'asgn-1',
      title: 'Python: Implement Linked List',
      subject: 'py',
      assignedDate: daysFromNow(-10),
      dueDate: daysFromNow(-3),
      priority: 'High',
      status: 'pending',
      description: 'Implement singly and doubly linked list with insert, delete, and search operations in Python.',
    },
    {
      id: 'asgn-2',
      title: 'DS: Binary Search Tree',
      subject: 'ds',
      assignedDate: daysFromNow(-7),
      dueDate: daysFromNow(2),
      priority: 'High',
      status: 'pending',
      description: 'Build a BST with in-order, pre-order, and post-order traversal.',
    },
    {
      id: 'asgn-3',
      title: 'OS: Process Scheduling Report',
      subject: 'os',
      assignedDate: daysFromNow(-5),
      dueDate: daysFromNow(5),
      priority: 'Medium',
      status: 'pending',
      description: 'Write a report comparing FCFS, SJF, and Round Robin scheduling algorithms.',
    },
    {
      id: 'asgn-4',
      title: 'LA: Matrix Operations',
      subject: 'la',
      assignedDate: daysFromNow(-8),
      dueDate: daysFromNow(-1),
      priority: 'High',
      status: 'pending',
      description: 'Solve 5 matrix multiplication and inversion problems.',
    },
    {
      id: 'asgn-5',
      title: 'MIS: ER Diagram Design',
      subject: 'mis',
      assignedDate: daysFromNow(-14),
      dueDate: daysFromNow(7),
      priority: 'Medium',
      status: 'completed',
      description: 'Design an ER diagram for a college library management system.',
    },
    {
      id: 'asgn-6',
      title: 'Python: File Handling Project',
      subject: 'py',
      assignedDate: daysFromNow(-12),
      dueDate: daysFromNow(10),
      priority: 'Low',
      status: 'completed',
      description: 'Create a Python application that reads, writes, and processes CSV files.',
    },
    {
      id: 'asgn-7',
      title: 'DS: Graph Algorithms',
      subject: 'ds',
      assignedDate: daysFromNow(-3),
      dueDate: daysFromNow(14),
      priority: 'Medium',
      status: 'pending',
      description: 'Implement BFS and DFS algorithms with a sample graph.',
    },
    {
      id: 'asgn-8',
      title: 'OS: Memory Management Summary',
      subject: 'os',
      assignedDate: daysFromNow(-4),
      dueDate: daysFromNow(1),
      priority: 'High',
      status: 'pending',
      description: 'Summarize paging and segmentation concepts with diagrams.',
    },
    {
      id: 'asgn-9',
      title: 'LA: Eigenvalues & Eigenvectors',
      subject: 'la',
      assignedDate: daysFromNow(-2),
      dueDate: daysFromNow(18),
      priority: 'Low',
      status: 'pending',
      description: 'Solve 3 problems on finding eigenvalues and eigenvectors.',
    },
    {
      id: 'asgn-10',
      title: 'MIS: Data Flow Diagram',
      subject: 'mis',
      assignedDate: daysFromNow(-6),
      dueDate: daysFromNow(3),
      priority: 'High',
      status: 'pending',
      description: 'Draw Level-0 and Level-1 DFDs for an online exam system.',
    },
  ];
}

// ---------------------------------------------------------------
// EXAMINATIONS (5 upcoming)
// ---------------------------------------------------------------
export function buildSampleExams() {
  return [
    {
      id: 'exam-1',
      subject: 'py',
      title: 'Python TT1 Examination',
      date: daysFromNow(8),
      time: '10:00 AM',
      venue: 'Hall A – Room 101',
      maxMarks: 15,
    },
    {
      id: 'exam-2',
      subject: 'ds',
      title: 'Data Structures TT2 Examination',
      date: daysFromNow(12),
      time: '02:00 PM',
      venue: 'Hall B – Room 204',
      maxMarks: 15,
    },
    {
      id: 'exam-3',
      subject: 'os',
      title: 'Operating Systems TT3 Examination',
      date: daysFromNow(20),
      time: '11:00 AM',
      venue: 'Hall A – Room 103',
      maxMarks: 10,
    },
    {
      id: 'exam-4',
      subject: 'la',
      title: 'Linear Algebra Semester End Examination',
      date: daysFromNow(30),
      time: '09:00 AM',
      venue: 'Examination Hall – Block C',
      maxMarks: 60,
    },
    {
      id: 'exam-5',
      subject: 'mis',
      title: 'MIS Semester End Examination',
      date: daysFromNow(25),
      time: '03:00 PM',
      venue: 'Computer Lab 2',
      maxMarks: 60,
    },
  ];
}

// ---------------------------------------------------------------
// SUBJECT MARKS
// Structure: one record per subject with tt1, tt2, tt3, see values.
// null means "not entered yet".
// ---------------------------------------------------------------
export function buildSampleSubjectMarks() {
  return [
    // Python – decent performance (total ~73)
    { id: 'sm-py',  subject: 'py',  tt1: 11, tt2: 12, tt3: 7,  see: 43 },
    // Data Structures – borderline (total ~59)
    { id: 'sm-ds',  subject: 'ds',  tt1: 9,  tt2: 9,  tt3: 6,  see: 35 },
    // Operating Systems – needs attention (total ~52)
    { id: 'sm-os',  subject: 'os',  tt1: 7,  tt2: 8,  tt3: 5,  see: 32 },
    // Linear Algebra – needs attention (total ~49)
    { id: 'sm-la',  subject: 'la',  tt1: 6,  tt2: 7,  tt3: 4,  see: 32 },
    // MIS – good performance (total ~81)
    { id: 'sm-mis', subject: 'mis', tt1: 13, tt2: 12, tt3: 8,  see: 48 },
  ];
}
