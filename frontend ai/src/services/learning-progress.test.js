import assert from 'node:assert/strict'
import test from 'node:test'
import { loadLearningProgress, markAssignmentPassed, saveLearningProgress } from './learning-progress.js'

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
    assert.equal(JSON.parse(storage.get('dsa-mentor-learning-progress')).version, 2)
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor)
    else delete globalThis.localStorage
  }
})
