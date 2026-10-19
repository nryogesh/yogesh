import assert from 'node:assert/strict'
import test from 'node:test'
import { appendTutorMessage, createTutorSubmissionGate } from './tutor-submission.js'

test('submission gate captures each exact message once and unlocks for the next submission', () => {
  const gate = createTutorSubmissionGate()
  const first = '  Explain arrays in 3 simple bullet points  '

  assert.equal(gate.capture(first), first)
  assert.equal(gate.capture('Explain binary search with a small Java example'), null)
  gate.release()

  const second = 'Explain binary search with a small Java example'
  assert.equal(gate.capture(second), second)
  assert.equal(gate.capture(second), null)

  const history = appendTutorMessage(
    appendTutorMessage([], { role: 'user', content: first }),
    { role: 'user', content: second }
  )
  assert.deepEqual(history.map((message) => message.content), [first, second])
})

test('submission gate ignores blank input without blocking a later message', () => {
  const gate = createTutorSubmissionGate()
  assert.equal(gate.capture(' \n '), null)
  assert.equal(gate.capture('Arrays'), 'Arrays')
})
