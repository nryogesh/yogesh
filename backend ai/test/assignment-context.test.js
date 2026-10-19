import assert from 'node:assert/strict'
import test from 'node:test'
import { getPublicAssignmentContext } from '../src/services/assignment-context.js'

test('assignment context contains public problem details but excludes reference and grading data', () => {
  const context = getPublicAssignmentContext('pf-assignment-1')

  assert.equal(context.topic, 'Programming Fundamentals')
  assert.equal(context.assignment.title, 'Sum of values with a loop')
  assert.ok(context.assignment.description)
  assert.ok(context.assignment.constraints.length > 0)
  assert.ok(context.assignment.hints.length > 0)
  assert.equal(context.assignment.referenceSolution, undefined)
  assert.equal(context.assignment.expectedComplexity, undefined)
  assert.equal(context.assignment.answerKey, undefined)
  assert.equal(context.assignment.testCases, undefined)
  assert.doesNotMatch(JSON.stringify(context), /referenceSolution|expectedComplexity|answerKey|testCases|grading/)
})

test('assignment context lookup rejects unknown or unpublished assignments', () => {
  assert.equal(getPublicAssignmentContext('not-an-assignment'), null)
  assert.equal(getPublicAssignmentContext('backtracking-assignment-1'), null)
})
