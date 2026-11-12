import assert from 'node:assert/strict'
import test from 'node:test'
import { clearLearnerProfile, loadLearnerProfile, saveLearnerProfile } from './learner-profile.js'

function withStorage(run) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const values = new Map()
  const events = []
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => values.get(key) || null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    },
  })
  const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window')
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { dispatchEvent: (event) => events.push(event.type) },
  })

  try {
    run({ events })
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor)
    else delete globalThis.localStorage
    if (windowDescriptor) Object.defineProperty(globalThis, 'window', windowDescriptor)
    else delete globalThis.window
  }
}

test('demo profile persists validated learner details and can be signed out without removing progress', () => {
  withStorage(({ events }) => {
    assert.equal(loadLearnerProfile(), null)
    const profile = saveLearnerProfile({ displayName: '  Demo Student ', learningGoal: 'Learn Java DSA' })
    assert.equal(profile.displayName, 'Demo Student')
    assert.equal(loadLearnerProfile().learningGoal, 'Learn Java DSA')
    clearLearnerProfile()
    assert.equal(loadLearnerProfile(), null)
    assert.deepEqual(events, ['dsa-mentor-profile-change', 'dsa-mentor-profile-change'])
  })
})

test('profile validation rejects empty and oversized names', () => {
  withStorage(() => {
    assert.throws(() => saveLearnerProfile({ displayName: ' ', learningGoal: 'Learn' }), /display name/)
    assert.throws(() => saveLearnerProfile({ displayName: 'Student', learningGoal: '' }), /learning goal/)
  })
})
