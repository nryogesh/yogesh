import assert from 'node:assert/strict'
import test from 'node:test'
import { buildProblemInput, ProblemInputError } from '../src/models/problem.js'

test('problem input defaults omitted values', () => {
  assert.deepEqual(buildProblemInput(), {
    topic: 'Arrays',
    difficulty: 'easy',
    user_level: 'beginner',
  })
})

test('problem input trims topic and normalizes difficulty and learner level', () => {
  assert.deepEqual(buildProblemInput({
    topic: '  Binary Search  ',
    difficulty: 'MEDIUM',
    userLevel: 'Intermediate',
  }), {
    topic: 'Binary Search',
    difficulty: 'medium',
    user_level: 'intermediate',
  })
})

test('problem input rejects unsupported choices', () => {
  assert.throws(() => buildProblemInput({ difficulty: 'expert' }), ProblemInputError)
  assert.throws(() => buildProblemInput({ user_level: 'newbie' }), ProblemInputError)
})

test('problem input rejects invalid objects and overlong topics', () => {
  assert.throws(() => buildProblemInput([]), ProblemInputError)
  assert.throws(() => buildProblemInput({ topic: 'x'.repeat(81) }), ProblemInputError)
})