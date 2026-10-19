const STORAGE_KEY = 'dsa-mentor-learning-progress'
const STORAGE_VERSION = 2

function normalizeProgress(value = {}) {
  const ids = (items) => Array.isArray(items)
    ? [...new Set(items.filter((item) => typeof item === 'string'))]
    : []

  return {
    viewedLessons: ids(value.viewedLessons),
    completedAssignments: ids(value.completedAssignments),
    passedQuizzes: ids(value.passedQuizzes),
  }
}

export function loadLearningProgress() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return normalizeProgress()

  try {
    const parsed = JSON.parse(stored)
    return normalizeProgress({
      ...parsed,
      completedAssignments: parsed?.version === STORAGE_VERSION ? parsed.completedAssignments : [],
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
    : { ...progress, viewedLessons: [...progress.viewedLessons, topicId] }
}

export function markQuizPassed(progress, quizId) {
  return progress.passedQuizzes.includes(quizId)
    ? progress
    : { ...progress, passedQuizzes: [...progress.passedQuizzes, quizId] }
}

export function markAssignmentPassed(progress, assignmentId, evaluation) {
  if (evaluation?.success !== true || evaluation.status !== 'passed' || evaluation.passed !== true) {
    return progress
  }

  return progress.completedAssignments.includes(assignmentId)
    ? progress
    : { ...progress, completedAssignments: [...progress.completedAssignments, assignmentId] }
}
