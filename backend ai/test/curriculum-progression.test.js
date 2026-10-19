import assert from 'node:assert/strict'
import test from 'node:test'

import { gradeTopicQuiz, getPublicCurriculum } from '../src/services/curriculum-service.js'

function findTopic(topics, topicId) {
  const topic = topics.find((candidate) => candidate.id === topicId)
  assert.ok(topic, `Expected ${topicId} to exist`)
  return topic
}

function completeTopicProgress(topicId, assignmentIds, quizIds, base = {}) {
  return {
    viewedLessons: [...(base.viewedLessons || []), topicId],
    completedAssignments: [...(base.completedAssignments || []), ...assignmentIds],
    passedQuizzes: [...(base.passedQuizzes || []), ...quizIds],
  }
}

test('curriculum locks topics until all prerequisite requirements are complete', () => {
  const topics = getPublicCurriculum()
  assert.equal(findTopic(topics, 'programming-fundamentals').progression.status, 'available')
  assert.equal(findTopic(topics, 'arrays').progression.status, 'locked')
  assert.deepEqual(findTopic(topics, 'arrays').progression.unmetPrerequisites, ['programming-fundamentals'])
  assert.equal(findTopic(topics, 'backtracking').progression.status, 'locked')

  const fundamentalsProgress = completeTopicProgress(
    'programming-fundamentals',
    ['pf-assignment-1', 'pf-assignment-2', 'pf-assignment-3'],
    ['pf-quiz-1']
  )
  const unlocked = getPublicCurriculum(fundamentalsProgress)
  assert.equal(findTopic(unlocked, 'arrays').progression.status, 'available')
  assert.equal(findTopic(unlocked, 'strings').progression.status, 'available')
  assert.equal(findTopic(unlocked, 'recursion').progression.status, 'available')
})

test('topic completion requires a viewed lesson, all assignments and a passed quiz', () => {
  const topic = findTopic(getPublicCurriculum(), 'programming-fundamentals')
  assert.deepEqual(topic.completionRequirements, {
    lessonViewed: true,
    assignmentIds: ['pf-assignment-1', 'pf-assignment-2', 'pf-assignment-3'],
    quizIds: ['pf-quiz-1'],
    quizPassRule: 'all-questions-correct',
  })

  const lessonOnly = getPublicCurriculum({ viewedLessons: ['programming-fundamentals'] })
  assert.equal(findTopic(lessonOnly, 'programming-fundamentals').progression.status, 'in-progress')

  const assignmentsDone = completeTopicProgress(
    'programming-fundamentals',
    ['pf-assignment-1', 'pf-assignment-2', 'pf-assignment-3'],
    []
  )
  assert.equal(findTopic(getPublicCurriculum(assignmentsDone), 'programming-fundamentals').progression.status, 'in-progress')

  const completed = completeTopicProgress(
    'programming-fundamentals',
    ['pf-assignment-1', 'pf-assignment-2', 'pf-assignment-3'],
    ['pf-quiz-1']
  )
  const fundamentals = findTopic(getPublicCurriculum(completed), 'programming-fundamentals')
  assert.equal(fundamentals.progression.status, 'completed')
  assert.deepEqual(fundamentals.progression.nextRecommendedTopic, { id: 'arrays', title: 'Arrays' })
})

test('prerequisite completion cannot be bypassed by progress recorded on a locked topic', () => {
  const progress = completeTopicProgress(
    'arrays',
    ['arrays-assignment-1', 'arrays-assignment-2', 'arrays-assignment-3'],
    ['arrays-quiz-1']
  )
  const topics = getPublicCurriculum(progress)

  assert.equal(findTopic(topics, 'arrays').progression.status, 'locked')
  assert.equal(findTopic(topics, 'linked-lists').progression.status, 'locked')
})

test('locked topic content stays unavailable through the progression endpoint', () => {
  const topics = getPublicCurriculum({}, { includeLockedContent: false })
  const arrays = findTopic(topics, 'arrays')

  assert.equal(arrays.progression.status, 'locked')
  assert.equal(Object.hasOwn(arrays, 'lessonSections'), false)
  assert.equal(Object.hasOwn(arrays, 'assignments'), false)
  assert.equal(Object.hasOwn(arrays, 'quizzes'), false)
  assert.equal(arrays.lessonAvailable, true)
})

test('quiz grading validates answers without exposing answer keys in curriculum data', () => {
  const topics = getPublicCurriculum()
  const fundamentals = findTopic(topics, 'programming-fundamentals')
  assert.equal(gradeTopicQuiz({
    topicId: 'programming-fundamentals',
    quizId: 'pf-quiz-1',
    answers: ['To group reusable logic'],
  }), true)
  assert.equal(gradeTopicQuiz({
    topicId: 'programming-fundamentals',
    quizId: 'pf-quiz-1',
    answers: ['To store one variable forever'],
  }), false)
  assert.equal(gradeTopicQuiz({
    topicId: 'programming-fundamentals',
    quizId: 'pf-quiz-1',
    answers: [],
  }), null)
  assert.doesNotMatch(JSON.stringify(fundamentals.quizzes), /correctAnswer|answerKey|explanation/)
})
