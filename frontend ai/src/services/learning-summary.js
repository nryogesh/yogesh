import { getLearningStreak } from './learning-progress.js'

export function summarizeLearning(topics, progress, now = new Date()) {
  const completedTopics = topics.filter((topic) => topic.progression.status === 'completed')
  const inProgressTopics = topics.filter((topic) => topic.progression.status === 'in-progress')
  const publishedTopics = topics.filter((topic) => topic.lessonAvailable)
  const attempts = progress.assignmentStats.attempts
  const nextTopic = inProgressTopics[0] || topics.find((topic) => topic.progression.status === 'available')

  return {
    completedTopics: completedTopics.length,
    inProgressTopics: inProgressTopics.length,
    publishedTopics: publishedTopics.length,
    completionPercent: publishedTopics.length ? Math.round((completedTopics.length / publishedTopics.length) * 100) : 0,
    problemsSolved: progress.completedAssignments.length,
    accuracy: attempts ? Math.round((progress.assignmentStats.passes / attempts) * 100) : null,
    assignmentAttempts: attempts,
    streak: getLearningStreak(progress, now),
    nextTopic,
    recentActivity: progress.recentActivity.slice(0, 8),
  }
}
