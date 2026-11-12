import assert from 'node:assert/strict'
import test from 'node:test'
import { summarizeLearning } from './learning-summary.js'

const now = new Date('2026-11-12T12:00:00.000Z')

test('learning summary reports only recorded curriculum and evaluator activity', () => {
  const topics = [
    { lessonAvailable: true, progression: { status: 'completed' } },
    { lessonAvailable: true, progression: { status: 'in-progress' } },
    { lessonAvailable: false, progression: { status: 'locked' } },
    { id: 'next', name: 'Next', lessonAvailable: true, progression: { status: 'available' } },
  ]
  const progress = {
    completedAssignments: ['array-sum'],
    assignmentStats: { attempts: 4, passes: 2 },
    recentActivity: [
      { type: 'lesson-viewed', id: 'arrays', at: '2026-11-12T10:00:00.000Z' },
      { type: 'assignment-passed', id: 'array-sum', at: '2026-11-11T10:00:00.000Z' },
    ],
  }

  assert.deepEqual(summarizeLearning(topics, progress, now), {
    completedTopics: 1,
    inProgressTopics: 1,
    publishedTopics: 3,
    completionPercent: 33,
    problemsSolved: 1,
    accuracy: 50,
    assignmentAttempts: 4,
    streak: 2,
    nextTopic: topics[1],
    recentActivity: progress.recentActivity,
  })
})

test('accuracy stays unavailable before an assignment has been evaluated', () => {
  const summary = summarizeLearning([], {
    completedAssignments: [],
    assignmentStats: { attempts: 0, passes: 0 },
    recentActivity: [],
  }, now)

  assert.equal(summary.accuracy, null)
  assert.equal(summary.streak, 0)
})
