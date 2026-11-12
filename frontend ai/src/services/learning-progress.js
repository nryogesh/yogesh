const STORAGE_KEY = 'dsa-mentor-learning-progress'
const STORAGE_VERSION = 3

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function positiveCount(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : 0
}

function normalizeProgress(value = {}) {
  const ids = (items) => Array.isArray(items)
    ? [...new Set(items.filter((item) => typeof item === 'string'))]
    : []

  return {
    viewedLessons: ids(value.viewedLessons),
    completedAssignments: ids(value.completedAssignments),
    passedQuizzes: ids(value.passedQuizzes),
    assignmentStats: {
      attempts: positiveCount(value.assignmentStats?.attempts),
      passes: positiveCount(value.assignmentStats?.passes),
    },
    recentActivity: Array.isArray(value.recentActivity)
      ? value.recentActivity
        .filter((item) => isRecord(item) &&
          ['lesson-viewed', 'quiz-passed', 'assignment-passed', 'assignment-failed'].includes(item.type) &&
          typeof item.id === 'string' && typeof item.at === 'string' && Number.isFinite(Date.parse(item.at)))
        .slice(0, 50)
        .map(({ type, id, at }) => ({ type, id, at }))
      : [],
  }
}

export function loadLearningProgress() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return normalizeProgress()

  try {
    const parsed = JSON.parse(stored)
    return normalizeProgress({
      ...parsed,
      completedAssignments: parsed?.version >= 2 ? parsed.completedAssignments : [],
    })
  } catch {
    throw new Error('Saved learning progress is unreadable. Clear this site’s local storage to start fresh.')
  }
}

export function saveLearningProgress(progress) {
  const normalized = normalizeProgress(progress)
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...normalized, version: STORAGE_VERSION }))
  return normalized
}

export function toggleCompletedAssignment(progress, assignmentId) {
  const completedAssignments = new Set(progress.completedAssignments)
  if (completedAssignments.has(assignmentId)) {
    completedAssignments.delete(assignmentId)
  } else {
    completedAssignments.add(assignmentId)
  }

  return { ...progress, completedAssignments: [...completedAssignments] }
}

export function markLessonViewed(progress, topicId) {
  return progress.viewedLessons.includes(topicId)
    ? progress
    : {
      ...progress,
      viewedLessons: [...progress.viewedLessons, topicId],
      recentActivity: [{ type: 'lesson-viewed', id: topicId, at: new Date().toISOString() }, ...progress.recentActivity].slice(0, 50),
    }
}

export function markQuizPassed(progress, quizId) {
  return progress.passedQuizzes.includes(quizId)
    ? progress
    : {
      ...progress,
      passedQuizzes: [...progress.passedQuizzes, quizId],
      recentActivity: [{ type: 'quiz-passed', id: quizId, at: new Date().toISOString() }, ...progress.recentActivity].slice(0, 50),
    }
}

export function markAssignmentPassed(progress, assignmentId, evaluation) {
  if (evaluation?.success !== true || evaluation.status !== 'passed' || evaluation.passed !== true) {
    return progress
  }

  return progress.completedAssignments.includes(assignmentId)
    ? progress
    : { ...progress, completedAssignments: [...progress.completedAssignments, assignmentId] }
}

export function recordAssignmentAttempt(progress, assignmentId, evaluation) {
  const passed = evaluation?.success === true && evaluation.status === 'passed' && evaluation.passed === true
  const type = passed ? 'assignment-passed' : 'assignment-failed'
  const attemptedProgress = {
    ...progress,
    assignmentStats: {
      attempts: progress.assignmentStats.attempts + 1,
      passes: progress.assignmentStats.passes + Number(passed),
    },
    recentActivity: [{ type, id: assignmentId, at: new Date().toISOString() }, ...progress.recentActivity].slice(0, 50),
  }

  return passed
    ? markAssignmentPassed(attemptedProgress, assignmentId, evaluation)
    : attemptedProgress
}

export function getLearningStreak(progress, now = new Date()) {
  const activeDays = new Set(progress.recentActivity.map(({ at }) => new Date(at).toISOString().slice(0, 10)))
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  let cursor = today

  if (!activeDays.has(new Date(cursor).toISOString().slice(0, 10))) {
    cursor -= 24 * 60 * 60 * 1000
    if (!activeDays.has(new Date(cursor).toISOString().slice(0, 10))) return 0
  }

  let streak = 0
  while (activeDays.has(new Date(cursor).toISOString().slice(0, 10))) {
    streak += 1
    cursor -= 24 * 60 * 60 * 1000
  }

  return streak
}
