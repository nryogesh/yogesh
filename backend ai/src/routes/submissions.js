import express from 'express'
import { dsaTopics } from '../data/topics.js'
import { javaEvaluationCases } from '../data/evaluation-cases.js'
import { SubmissionInputError } from '../models/submission.js'
import { SubmissionService } from '../services/submission-service.js'

function createSubmissionsRouter(submissionService = new SubmissionService()) {
  const router = express.Router()

  router.get('/:assignmentId', async (request, response) => {
    const assignment = dsaTopics
      .filter((topic) => topic.status === 'published')
      .flatMap((topic) => topic.assignments)
      .find((item) => item.id === request.params.assignmentId)

    if (!assignment) {
      return response.status(404).json({ success: false, error: 'Published assignment was not found' })
    }

    const starterCode = javaEvaluationCases[assignment.id]?.starterCode
    const evaluationStatus = await submissionService.getEvaluationStatus(assignment.id)
    return response.json({
      success: true,
      assignmentId: assignment.id,
      language: assignment.language,
      hasTests: Boolean(javaEvaluationCases[assignment.id]),
      evaluationAvailable: evaluationStatus.available,
      evaluationMessage: evaluationStatus.message,
      starterCode: starterCode || null,
    })
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

      return response.status(error.statusCode || 503).json({
        success: false,
        error: error.message || 'Java evaluation is unavailable',
      })
    }
  })

  return router
}

export const submissionsRouter = createSubmissionsRouter()
export { createSubmissionsRouter }