import assert from 'node:assert/strict'
import test from 'node:test'
import { getLearningStreak, loadLearningProgress, markAssignmentPassed, recordAssignmentAttempt, saveLearningProgress } from './learning-progress.js'

test('assignment progress changes only after an evaluator-confirmed pass', () => {
  const progress = {
    viewedLessons: ['programming-fundamentals'],
    completedAssignments: [],
    passedQuizzes: [],
  }

  assert.equal(markAssignmentPassed(progress, 'pf-assignment-1', { success: true, status: 'failed', passed: false }), progress)
  assert.equal(markAssignmentPassed(progress, 'pf-assignment-1', { success: false, status: 'passed', passed: true }), progress)
  assert.deepEqual(
    markAssignmentPassed(progress, 'pf-assignment-1', { success: true, status: 'passed', passed: true }),
    { ...progress, completedAssignments: ['pf-assignment-1'] }
  )
})

test('legacy self-reported assignment completion is not retained after evaluation migration', () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const storage = new Map([[
    'dsa-mentor-learning-progress',
    JSON.stringify({
      viewedLessons: ['programming-fundamentals'],
      completedAssignments: ['pf-assignment-1'],
      passedQuizzes: ['pf-quiz-1'],
    }),
  ]])
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => storage.get(key) || null,
      setItem: (key, value) => storage.set(key, value),
    },
  })

  try {
    const migrated = loadLearningProgress()
    assert.deepEqual(migrated.completedAssignments, [])
    assert.deepEqual(migrated.viewedLessons, ['programming-fundamentals'])
    assert.deepEqual(migrated.passedQuizzes, ['pf-quiz-1'])

    saveLearningProgress(migrated)
    assert.equal(JSON.parse(storage.get('dsa-mentor-learning-progress')).version, 3)
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor)
    else delete globalThis.localStorage
  }
})

test('assignment evaluation attempts and passes are tracked independently from unique solved problems', () => {
  const progress = {
    viewedLessons: [],
    completedAssignments: [],
    passedQuizzes: [],
    assignmentStats: { attempts: 0, passes: 0 },
    recentActivity: [],
  }
  const failed = recordAssignmentAttempt(progress, 'array-sum', { success: true, status: 'compile_error', passed: false })
  const passed = recordAssignmentAttempt(failed, 'array-sum', { success: true, status: 'passed', passed: true })
  const repeatedPass = recordAssignmentAttempt(passed, 'array-sum', { success: true, status: 'passed', passed: true })

  assert.deepEqual(repeatedPass.assignmentStats, { attempts: 3, passes: 2 })
  assert.deepEqual(repeatedPass.completedAssignments, ['array-sum'])
  assert.equal(repeatedPass.recentActivity.length, 3)
})

test('learning streak counts consecutive days with recorded activity only', () => {
  const progress = {
    recentActivity: [
      { type: 'lesson-viewed', id: 'arrays', at: '2026-11-12T10:00:00.000Z' },
      { type: 'assignment-passed', id: 'array-sum', at: '2026-11-11T10:00:00.000Z' },
      { type: 'quiz-passed', id: 'arrays-quiz', at: '2026-11-09T10:00:00.000Z' },
    ],
  }

  assert.equal(getLearningStreak(progress, new Date('2026-11-12T14:00:00.000Z')), 2)
  assert.equal(getLearningStreak(progress, new Date('2026-11-15T14:00:00.000Z')), 0)
})
