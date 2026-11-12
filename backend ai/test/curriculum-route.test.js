import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import test from 'node:test'
import express from 'express'
import { curriculumRouter } from '../src/routes/curriculum.js'

test('curriculum endpoint returns public topic content without answer data', async () => {
  const app = express()
  app.use('/', curriculumRouter)
  const server = createServer(app)
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })

  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/`)
    const payload = await response.json()

    assert.equal(response.status, 200)
    assert.equal(payload.success, true)

    const fundamentals = payload.topics.find((topic) => topic.id === 'programming-fundamentals')
    assert.equal(fundamentals.status, 'published')
    assert.ok(fundamentals.learningObjectives.length > 0)
    assert.ok(fundamentals.lessonSections.length > 0)
    assert.ok(fundamentals.workedExample.dryRun)
    assert.ok(fundamentals.javaExample.code.includes('public class Main'))
    assert.ok(fundamentals.javaExample.expectedOutput)
    assert.ok(fundamentals.complexityNote)
    assert.ok(fundamentals.commonMistakes.length > 0)
    assert.ok(fundamentals.referenceNotes.length > 0)
    assert.ok(fundamentals.assignments[0].examples.length > 0)
    assert.ok(fundamentals.quizzes[0].questions.length > 0)
    assert.deepEqual(
      Object.keys(fundamentals.quizzes[0].questions[0]).sort(),
      ['options', 'question']
    )

    const planned = payload.topics.find((topic) => topic.id === 'backtracking')
    assert.equal(planned.status, 'planned')
    assert.equal(Object.hasOwn(planned, 'lessonSections'), false)
    const publicAssignments = payload.topics
      .filter((topic) => topic.status === 'published')
      .flatMap((topic) => topic.assignments)
    assert.equal(publicAssignments.length, 30)
    assert.ok(publicAssignments.every((assignment) => assignment.language === 'Java' && assignment.edgeCases.length > 0))
    assert.ok(publicAssignments.every((assignment) => (
      !Object.hasOwn(assignment, 'referenceSolution') &&
      !Object.hasOwn(assignment, 'expectedComplexity') &&
      !Object.hasOwn(assignment, 'grading')
    )))
    assert.doesNotMatch(JSON.stringify(payload), /answerKey|correctAnswer|referenceSolution|expectedComplexity|grading|progressionRules|contentStatus/)
  } finally {
    const closed = new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
    server.closeAllConnections()
    await closed
  }
})

test('progression endpoint gates locked topic content and quiz submission returns no grading details', async () => {
  const app = express()
  app.use('/', curriculumRouter)
  const server = createServer(app)
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })

  try {
    const baseUrl = `http://127.0.0.1:${server.address().port}`
    const lockedResponse = await fetch(`${baseUrl}/progression`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const lockedPayload = await lockedResponse.json()
    const arrays = lockedPayload.topics.find((topic) => topic.id === 'arrays')
    assert.equal(arrays.progression.status, 'locked')
    assert.equal(Object.hasOwn(arrays, 'lessonSections'), false)
    assert.equal(Object.hasOwn(arrays, 'assignments'), false)

    const progress = {
      viewedLessons: ['programming-fundamentals'],
      completedAssignments: ['pf-assignment-1', 'pf-assignment-2', 'pf-assignment-3'],
      passedQuizzes: ['pf-quiz-1'],
    }
    const quizResponse = await fetch(`${baseUrl}/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topicId: 'programming-fundamentals',
        quizId: 'pf-quiz-1',
        answers: ['To group reusable logic'],
        progress,
      }),
    })
    const quizPayload = await quizResponse.json()
    assert.equal(quizResponse.status, 200)
    assert.deepEqual(quizPayload, { success: true, passed: true })
    assert.doesNotMatch(JSON.stringify(quizPayload), /correctAnswer|answerKey|explanation|grading/)
  } finally {
    const closed = new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
    server.closeAllConnections()
    await closed
  }
})