import assert from 'node:assert/strict'
import test from 'node:test'
import { dsaTopics } from '../src/data/topics.js'

test('every published topic has a complete Java assignment progression', () => {
  const publishedTopics = dsaTopics.filter((topic) => topic.status === 'published')
  const assignmentIds = publishedTopics.flatMap((topic) => topic.assignments.map((assignment) => assignment.id))

  assert.equal(publishedTopics.length, 10)
  assert.equal(new Set(assignmentIds).size, assignmentIds.length, 'assignment IDs should be unique')

  for (const topic of publishedTopics) {
    assert.deepEqual(
      topic.assignments.map((assignment) => assignment.difficulty).sort(),
      ['advanced', 'beginner', 'intermediate'],
      `${topic.id} should progress through all three difficulties`
    )

    for (const assignment of topic.assignments) {
      assert.equal(assignment.language, 'Java', `${assignment.id} should target Java practice`)
      assert.ok(assignment.description.trim().length >= 30, `${assignment.id} should have a standalone problem statement`)
      assert.ok(assignment.constraints.length >= 2, `${assignment.id} should define constraints`)
      assert.ok(assignment.examples.length > 0, `${assignment.id} should provide examples`)
      assert.ok(assignment.examples.every((example) => example.input && example.output && example.explanation), `${assignment.id} examples should include input and output`)
      assert.ok(assignment.edgeCases.length >= 2, `${assignment.id} should identify edge cases`)
      assert.ok(assignment.learningObjectives.length >= 2, `${assignment.id} should include learning objectives`)
      assert.ok(assignment.hints.length >= 2, `${assignment.id} should provide progressive hints`)
      assert.equal(new Set(assignment.hints).size, assignment.hints.length, `${assignment.id} hints should advance rather than repeat`)
      assert.ok(assignment.hints.every((hint) => hint.trim().length >= 20), `${assignment.id} hints should be actionable`)
      assert.ok(assignment.referenceSolution, `${assignment.id} should retain an internal reference solution`)
    }
  }
})