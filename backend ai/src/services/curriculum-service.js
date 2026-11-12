import { dsaTopics } from '../data/topics.js'

function toPublicTopic(topic) {
  const isPublished = topic.status === 'published' && topic.contentStatus === 'verified'
  const publicTopic = {
    id: topic.id,
    name: topic.name,
    category: topic.category,
    level: topic.level,
    description: topic.description,
    prerequisites: [...(topic.prerequisites || [])],
    status: isPublished ? 'published' : 'planned',
  }

  if (!isPublished) return publicTopic

  return {
    ...publicTopic,
    learningObjectives: [...topic.learningObjectives],
    lessonSections: topic.lessonSections.map(({ title, explanation }) => ({ title, explanation })),
    workedExample: {
      title: topic.workedExample.title,
      steps: [...topic.workedExample.steps],
      dryRun: topic.workedExample.dryRun,
    },
    javaExample: {
      title: topic.javaExample.title,
      code: topic.javaExample.code,
      expectedOutput: topic.javaExample.expectedOutput,
      explanation: topic.javaExample.explanation,
    },
    complexityNote: topic.complexityNote,
    commonMistakes: [...topic.commonMistakes],
    referenceNotes: [...topic.referenceNotes],
    referenceLinks: topic.referenceLinks.map(({ label, url, kind }) => ({ label, url, kind })),
    assignments: topic.assignments.map((assignment) => ({
      id: assignment.id,
      title: assignment.title,
      difficulty: assignment.difficulty,
      language: assignment.language,
      description: assignment.description,
      constraints: [...assignment.constraints],
      examples: assignment.examples.map(({ input, output, explanation }) => ({ input, output, explanation })),
      edgeCases: [...assignment.edgeCases],
      learningObjectives: [...assignment.learningObjectives],
      hints: [...assignment.hints],
    })),
    quizzes: topic.quizzes.map((quiz) => ({
      id: quiz.id,
      questions: quiz.questions.map(({ question, options }) => ({
        question,
        options: [...options],
      })),
    })),
  }
}

function toIdSet(values) {
  return new Set(Array.isArray(values) ? values.filter((value) => typeof value === 'string') : [])
}

export function getPublicCurriculum(progress = {}, { includeLockedContent = true } = {}) {
  const viewedLessons = toIdSet(progress.viewedLessons)
  const completedAssignments = toIdSet(progress.completedAssignments)
  const passedQuizzes = toIdSet(progress.passedQuizzes)
  const completedTopic = (topicId, visited = new Set()) => {
    if (visited.has(topicId)) return false
    const topic = dsaTopics.find((candidate) => candidate.id === topicId)
    if (!topic || topic.status !== 'published' || topic.contentStatus !== 'verified' ||
      !topic.lessonSections.length || !viewedLessons.has(topicId)) {
      return false
    }

    const nextVisited = new Set(visited).add(topicId)
    const quizzes = topic.quizzes.filter((quiz) => quiz.questions.length > 0)
    return topic.prerequisites.every((prerequisiteId) => completedTopic(prerequisiteId, nextVisited)) &&
      topic.assignments.every(({ id }) => completedAssignments.has(id)) &&
      quizzes.every(({ id }) => passedQuizzes.has(id))
  }

  return dsaTopics.map((topic) => {
    const publicTopic = toPublicTopic(topic)
    const lessonSections = publicTopic.lessonSections || []
    const referenceNotes = publicTopic.referenceNotes || []
    const assignments = publicTopic.assignments || []
    const quizzes = publicTopic.quizzes || []
    const lessonAvailable = publicTopic.status === 'published' && lessonSections.length > 0
    const notesAvailable = publicTopic.status === 'published' && referenceNotes.length > 0
    const workedExampleAvailable = publicTopic.status === 'published' && Boolean(publicTopic.workedExample?.steps.length)
    const assignmentsAvailable = publicTopic.status === 'published' && assignments.length > 0
    const quizAvailable = publicTopic.status === 'published' && quizzes.some((quiz) => quiz.questions.length > 0)
    const requiredAssignmentIds = assignments.map(({ id }) => id)
    const requiredQuizIds = quizzes.filter((quiz) => quiz.questions.length > 0).map(({ id }) => id)
    const unmetPrerequisites = topic.prerequisites.filter((prerequisiteId) => {
      return !completedTopic(prerequisiteId)
    })
    const unlocked = lessonAvailable && unmetPrerequisites.length === 0
    const lessonViewed = viewedLessons.has(topic.id)
    const completedAssignmentIds = requiredAssignmentIds.filter((id) => completedAssignments.has(id))
    const passedQuizIds = requiredQuizIds.filter((id) => passedQuizzes.has(id))
    const isCompleted = unlocked &&
      lessonViewed &&
      completedAssignmentIds.length === requiredAssignmentIds.length &&
      passedQuizIds.length === requiredQuizIds.length
    const hasStarted = lessonViewed || completedAssignmentIds.length > 0 || passedQuizIds.length > 0
    const nextTopic = isCompleted
      ? dsaTopics.find((candidate) => candidate.prerequisites.includes(topic.id) &&
        candidate.status === 'published' &&
        candidate.prerequisites.every((prerequisiteId) => completedTopic(prerequisiteId)))
      : null

    const curriculumTopic = {
      ...publicTopic,
      title: publicTopic.name,
      lessonAvailable,
      notesAvailable,
      workedExampleAvailable,
      assignmentsAvailable,
      quizAvailable,
      completionRequirements: {
        lessonViewed: lessonAvailable,
        assignmentIds: requiredAssignmentIds,
        quizIds: requiredQuizIds,
        quizPassRule: 'all-questions-correct',
      },
      progression: {
        unlocked,
        status: !unlocked ? 'locked' : isCompleted ? 'completed' : hasStarted ? 'in-progress' : 'available',
        unmetPrerequisites,
        lessonViewed,
        completedAssignmentIds,
        passedQuizIds,
        nextRecommendedTopic: nextTopic ? { id: nextTopic.id, title: nextTopic.name } : null,
      },
    }

    if (!includeLockedContent && !unlocked) {
      const {
        learningObjectives: _learningObjectives,
        lessonSections: _lessonSections,
        workedExample: _workedExample,
        javaExample: _javaExample,
        complexityNote: _complexityNote,
        commonMistakes: _commonMistakes,
        referenceNotes: _referenceNotes,
        referenceLinks: _referenceLinks,
        assignments: _assignments,
        quizzes: _quizzes,
        ...lockedTopic
      } = curriculumTopic
      return lockedTopic
    }

    return curriculumTopic
  })
}

export function gradeTopicQuiz({ topicId, quizId, answers }) {
  const topic = dsaTopics.find((candidate) => candidate.id === topicId)
  const quiz = topic?.quizzes.find((candidate) => candidate.id === quizId)

  if (!quiz || !Array.isArray(answers) || answers.length !== quiz.questions.length ||
    answers.some((answer) => typeof answer !== 'string')) {
    return null
  }

  return quiz.questions.every((question, index) => question.correctAnswer === answers[index])
}
