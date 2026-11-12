import assert from 'node:assert/strict'
import test from 'node:test'
import { javaEvaluationCases } from '../src/data/evaluation-cases.js'
import { getJavaSubmissionStarter } from '../src/services/submission-service.js'

test('every supported Java assignment receives an unfinished, signature-preserving starter', () => {
  for (const [assignmentId, fixture] of Object.entries(javaEvaluationCases)) {
    const starter = getJavaSubmissionStarter(assignmentId)
    assert.match(starter, /TODO: implement this method/, assignmentId)
    assert.match(starter, new RegExp(`\\b${fixture.methodName}\\s*\\(`), assignmentId)
    assert.notEqual(starter, fixture.starterCode, assignmentId)
  }
})
