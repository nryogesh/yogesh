import express from 'express'
import { HintInputError } from '../models/hint.js'
import { HintService } from '../services/hint-service.js'

const router = express.Router()
const hintService = new HintService()

router.post('/', async (request, response) => {
  try {
    const result = await hintService.provideHint(request.body || {})
    if (!result.success) {
      return response.status(503).json(result)
    }

    return response.json(result)
  } catch (error) {
    if (error instanceof HintInputError) {
      return response.status(400).json({ success: false, error: error.message })
    }

    console.error('Hint route error:', error)
    return response.status(500).json({ success: false, error: 'Hint generation failed' })
  }
})

export { router as hintsRouter }