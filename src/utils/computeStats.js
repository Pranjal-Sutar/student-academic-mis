// ============================================================
// computeStats.js  –  All data processing / analytics logic
// ============================================================
import { LOW_MARKS_THRESHOLD, ASSESSMENTS, TOTAL_MAX_MARKS } from '../data/sampleData.js';

// ---------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------
export function today() {
  return new Date().toISOString().split('T')[0];
}

export function isOverdue(dueDate, status) {
  return status !== 'completed' && dueDate < today();
}

export function isDueSoon(dueDate, status, daysWindow = 3) {
  if (status === 'completed') return false;
  const diff = dateDiffInDays(today(), dueDate);
  return diff >= 0 && diff <= daysWindow;
}

/** Returns dueDate – baseDate in days (can be negative) */
export function dateDiffInDays(baseDate, dueDate) {
  const ms = new Date(dueDate) - new Date(baseDate);
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ---------------------------------------------------------------
// Assignment statistics
// ---------------------------------------------------------------
export function computeAssignmentStats(assignments) {
  const total = assignments.length;
  const completed = assignments.filter(a => a.status === 'completed').length;
  const overdue = assignments.filter(a => isOverdue(a.dueDate, a.status)).length;
  const pending = assignments.filter(a => a.status === 'pending').length;
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, overdue, pending, completionPct };
}

// ---------------------------------------------------------------
// Subject marks / performance analysis
// ---------------------------------------------------------------

/**
 * For a single subject mark record, determine if all assessments are filled.
 * Returns { total, percentage, isComplete, missingFields }
 */
export function computeSubjectTotal(sm) {
  const missing = ASSESSMENTS.filter(a => sm[a.key] === null || sm[a.key] === undefined || sm[a.key] === '');
  if (missing.length > 0) {
    return { total: null, percentage: null, isComplete: false, missingFields: missing.map(m => m.label) };
  }
  const total = ASSESSMENTS.reduce((s, a) => s + Number(sm[a.key]), 0);
  const percentage = Math.round((total / TOTAL_MAX_MARKS) * 100);
  return { total, percentage, isComplete: true, missingFields: [] };
}

/**
 * For each subject compute:
 *  - total (out of 100), null if any assessment is missing
 *  - percentage, null if incomplete
 *  - isComplete
 *  - needsAttention (only flagged when complete and below threshold)
 */
export function computeSubjectPerformance(subjectMarks, subjects) {
  return subjects.map(sub => {
    const sm = subjectMarks.find(m => m.subject === sub.id);
    if (!sm) {
      return {
        subjectId: sub.id,
        subjectName: sub.name,
        subjectCode: sub.code || '',
        total: null,
        percentage: null,
        isComplete: false,
        missingFields: ['TT1', 'TT2', 'TT3', 'Semester End Examination'],
        needsAttention: false,
        markRecord: null,
      };
    }
    const result = computeSubjectTotal(sm);
    return {
      subjectId: sub.id,
      subjectName: sub.name,
      subjectCode: sub.code || '',
      total: result.total,
      percentage: result.percentage,
      isComplete: result.isComplete,
      missingFields: result.missingFields,
      needsAttention: result.isComplete && result.percentage < LOW_MARKS_THRESHOLD,
      markRecord: sm,
    };
  });
}

/**
 * Overall average across fully-complete subjects only.
 */
export function computeOverallAverage(subjectPerf) {
  const complete = subjectPerf.filter(s => s.isComplete);
  if (complete.length === 0) return null;
  return Math.round(complete.reduce((s, p) => s + p.percentage, 0) / complete.length);
}

// ---------------------------------------------------------------
// Workload recommendations (rule-based, no ML)
// Only generates marks-based recommendations for complete subjects.
// ---------------------------------------------------------------
export function generateRecommendations(assignments, subjectPerf) {
  const recs = [];

  // Rule 1 – Overdue assignments
  const overdueList = assignments.filter(a => isOverdue(a.dueDate, a.status));
  overdueList.forEach(a => {
    recs.push({
      id: `rec-overdue-${a.id}`,
      type: 'danger',
      title: `Overdue: ${a.title}`,
      detail: `This assignment was due on ${formatDate(a.dueDate)}. Submit it immediately.`,
    });
  });

  // Rule 2 – Due within 3 days (not overdue)
  const dueSoonList = assignments.filter(a => isDueSoon(a.dueDate, a.status, 3));
  dueSoonList.forEach(a => {
    const diff = dateDiffInDays(today(), a.dueDate);
    recs.push({
      id: `rec-soon-${a.id}`,
      type: 'warning',
      title: `Due in ${diff} day${diff !== 1 ? 's' : ''}: ${a.title}`,
      detail: `Assignment due on ${formatDate(a.dueDate)}. Start now to avoid missing the deadline.`,
    });
  });

  // Rule 3 – High-priority pending assignments
  const highPriority = assignments.filter(
    a => a.status === 'pending' && a.priority === 'High' && !isOverdue(a.dueDate, a.status) && !isDueSoon(a.dueDate, a.status, 3)
  );
  highPriority.forEach(a => {
    recs.push({
      id: `rec-hi-${a.id}`,
      type: 'warning',
      title: `High priority: ${a.title}`,
      detail: `This is a high-priority assignment due on ${formatDate(a.dueDate)}. Plan your time accordingly.`,
    });
  });

  // Rule 4 – Low-mark subjects (only when marks are complete)
  const lowSubs = subjectPerf.filter(s => s.needsAttention);
  lowSubs.forEach(s => {
    recs.push({
      id: `rec-marks-${s.subjectId}`,
      type: 'attention',
      title: `Low performance in ${s.subjectName}`,
      detail: `Your total is ${s.total}/${TOTAL_MAX_MARKS} (${s.percentage}%), below the ${LOW_MARKS_THRESHOLD}% threshold. Focus on this subject.`,
    });
  });

  // Rule 5 – Incomplete marks (reminder, not a warning)
  const incomplete = subjectPerf.filter(s => !s.isComplete && s.markRecord !== null);
  const noRecord   = subjectPerf.filter(s => s.markRecord === null);
  if (noRecord.length > 0) {
    recs.push({
      id: 'rec-no-marks',
      type: 'attention',
      title: `Marks not entered for ${noRecord.length} subject${noRecord.length > 1 ? 's' : ''}`,
      detail: `Enter marks in the Performance page to see subject-wise analysis and recommendations.`,
    });
  } else if (incomplete.length > 0) {
    recs.push({
      id: 'rec-incomplete-marks',
      type: 'attention',
      title: `Incomplete marks for ${incomplete.length} subject${incomplete.length > 1 ? 's' : ''}`,
      detail: `Some assessments are missing. Performance recommendations will show once all marks are entered.`,
    });
  }

  // Positive reinforcement when no issues
  if (recs.length === 0) {
    recs.push({
      id: 'rec-good',
      type: 'success',
      title: 'Great work! No urgent tasks.',
      detail: 'All assignments are on track and your performance looks good. Keep it up!',
    });
  }

  return recs;
}

// ---------------------------------------------------------------
// Upcoming exams (sorted by date, next N)
// ---------------------------------------------------------------
export function getUpcomingExams(exams, limit = 5) {
  return [...exams]
    .filter(e => e.date >= today())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}

// ---------------------------------------------------------------
// Upcoming deadlines (pending assignments sorted by dueDate)
// ---------------------------------------------------------------
export function getUpcomingDeadlines(assignments, limit = 5) {
  return [...assignments]
    .filter(a => a.status !== 'completed' && a.dueDate >= today())
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, limit);
}
