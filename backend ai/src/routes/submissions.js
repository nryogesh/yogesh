import express from 'express'
import { dsaTopics } from '../data/topics.js'
import { javaEvaluationCases } from '../data/evaluation-cases.js'
import { SubmissionInputError } from '../models/submission.js'
import { getJavaSubmissionSolution, getJavaSubmissionStarter, SubmissionService } from '../services/submission-service.js'

function createSubmissionsRouter(submissionService = new SubmissionService()) {
  const router = express.Router()

  router.get('/:assignmentId', async (request, response) => {
    const assignmentId = request.params.assignmentId
    const assignment = dsaTopics
      .filter((topic) => topic.status === 'published')
      .flatMap((topic) => topic.assignments)
      .find((item) => item.id === assignmentId)

    const fixture = javaEvaluationCases[assignmentId]

    if (!assignment && !fixture) {
      return response.status(404).json({ success: false, error: 'Assignment was not found' })
    }

    const starterCode = getJavaSubmissionStarter(assignmentId)
    const evaluationStatus = await submissionService.getEvaluationStatus(assignmentId)

    return response.json({
      success: true,
      assignmentId,
      title: assignment?.title || fixture?.title || assignmentId,
      language: assignment?.language || 'Java',
      hasTests: Boolean(fixture),
      evaluationAvailable: evaluationStatus.available,
      evaluationMessage: evaluationStatus.message,
      starterCode,
      samples: fixture?.samples || [],
    })
  })

  router.post('/:assignmentId/solution', (request, response) => {
    if (request.body?.confirm !== true) {
      return response.status(400).json({ success: false, error: 'Confirm that you want to reveal the solution.' })
    }

    const sourceCode = getJavaSubmissionSolution(request.params.assignmentId)
    if (!sourceCode) {
      return response.status(404).json({ success: false, error: 'A reference solution is not available for this assignment.' })
    }

    return response.json({ success: true, sourceCode })
  })

  router.post('/:assignmentId/run', async (request, response) => {
    try {
      const result = await submissionService.run({
        assignmentId: request.params.assignmentId,
        source: request.body?.source,
        customInput: request.body?.customInput,
      })
      return response.json({ success: true, ...result })
    } catch (error) {
      if (error instanceof SubmissionInputError) {
        return response.status(error.statusCode).json({ success: false, error: error.message })
      }

      return response.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Java execution failed',
      })
    }
  })

  router.post('/:assignmentId/evaluate', async (request, response) => {
    try {
      const result = await submissionService.evaluate({
        assignmentId: request.params.assignmentId,
        source: request.body?.source,
      })
      return response.json({ success: true, ...result })
    } catch (error) {
      if (error instanceof SubmissionInputError) {
        return response.status(error.statusCode).json({ success: false, error: error.message })
      }

      return response.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Java evaluation failed',
      })
    }
  })

  return router
}

export const submissionsRouter = createSubmissionsRouter()
export { createSubmissionsRouter }