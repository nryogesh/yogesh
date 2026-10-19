import express from 'express'
import { ProblemInputError } from '../models/problem.js'
import { ProblemService } from '../services/problem-service.js'

function createProblemsRouter(problemService = new ProblemService()) {
  const router = express.Router()

  router.post('/generate', async (request, response) => {
    try {
      const payload = request.body || {}
      const result = await problemService.generateProblem(payload)
      if (!result.success) {
        return response.status(503).json(result)
      }

      return response.json(result)
    } catch (error) {
      if (error instanceof ProblemInputError) {
        return response.status(400).json({
          success: false,
          error: error.message,
        })
      }

      console.error('Problem generation unavailable:', error?.code || 'GENERATION_ERROR')
      return response.status(503).json({
        success: false,
        error: 'Practice problem generation is temporarily unavailable. Please try again shortly.',
      })
    }
  })

  return router
}

export const problemsRouter = createProblemsRouter()
export { createProblemsRouter }
