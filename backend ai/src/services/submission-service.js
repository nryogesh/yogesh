import { javaEvaluationCases } from '../data/evaluation-cases.js'
import { dsaTopics } from '../data/topics.js'
import { buildSubmissionInput, SubmissionInputError } from '../models/submission.js'
import { JavaRunner } from './java-runner.js'

export class SubmissionServiceError extends Error {
  constructor(message, statusCode = 503) {
    super(message)
    this.statusCode = statusCode
  }
}

export class SubmissionService {
  constructor() {
    this.activeEvaluations = 0
  }

  async getEvaluationStatus(assignmentId) {
    const fixture = javaEvaluationCases[assignmentId]
    if (!fixture) {
      return { available: false, message: 'Automated evaluation is not configured for this assignment yet.' }
    }
    return {
      available: true,
      message: 'Automated Java 17 evaluation is ready.',
    }
  }

  async isEvaluationAvailable(assignmentId) {
    return Boolean(javaEvaluationCases[assignmentId])
  }

  async run(payload = {}) {
    const { assignmentId, source } = buildSubmissionInput(payload)
    const customInput = payload.customInput ?? null

    const assignmentExists = Boolean(javaEvaluationCases[assignmentId]) || dsaTopics.some((topic) => (
      topic.status === 'published' && topic.assignments.some((assignment) => assignment.id === assignmentId)
    ))
    if (!assignmentExists) {
      throw new SubmissionInputError('Assignment was not found', 404)
    }

    if (!javaEvaluationCases[assignmentId]) {
      throw new SubmissionInputError('Evaluation tests are not available for this assignment yet', 501)
    }

    return await JavaRunner.run({ assignmentId, source, customInput })
  }

  async evaluate(payload = {}) {
    const { assignmentId, source } = buildSubmissionInput(payload)

    const assignmentExists = Boolean(javaEvaluationCases[assignmentId]) || dsaTopics.some((topic) => (
      topic.status === 'published' && topic.assignments.some((assignment) => assignment.id === assignmentId)
    ))
    if (!assignmentExists) {
      throw new SubmissionInputError('Assignment was not found', 404)
    }

    const fixtures = javaEvaluationCases[assignmentId]
    if (!fixtures) {
      throw new SubmissionInputError('Evaluation tests are not available for this assignment yet', 501)
    }

    return await JavaRunner.evaluate({ assignmentId, source })
  }
}

export function getJavaSubmissionStarter(assignmentId) {
  return javaEvaluationCases[assignmentId]?.starterCode || null
}