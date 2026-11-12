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
  const fixture = javaEvaluationCases[assignmentId]
  if (!fixture?.starterCode) return null

  const methodName = fixture.methodName
  const methodPattern = new RegExp(`public\\s+([\\w.<>, ?\\[\\]]+)\\s+${methodName}\\s*\\(([^)]*)\\)\\s*\\{`)
  const method = methodPattern.exec(fixture.starterCode)
  if (!method) {
    throw new SubmissionServiceError(`Could not create a safe starter template for ${assignmentId}.`, 500)
  }

  const returnType = method[1].trim()
  const imports = fixture.starterCode
    .split(/\r?\n/)
    .filter((line) => /^\s*import\s+[^;]+;\s*$/.test(line))
  const defaultReturn = {
    boolean: 'return false;',
    byte: 'return 0;',
    short: 'return 0;',
    int: 'return 0;',
    long: 'return 0L;',
    float: 'return 0.0f;',
    double: 'return 0.0;',
    char: "return '\\0';",
  }[returnType]
  const body = returnType === 'void'
    ? '// TODO: implement this method.'
    : `// TODO: implement this method.\n        ${defaultReturn || 'return null;'}`

  return `${imports.length ? `${imports.join('\n')}\n\n` : ''}class Solution {\n    public ${returnType} ${methodName}(${method[2]}) {\n        ${body}\n    }\n}`
}

export function getJavaSubmissionSolution(assignmentId) {
  return javaEvaluationCases[assignmentId]?.starterCode || null
}