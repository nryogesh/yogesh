import express from 'express'
import { ChatService } from '../services/chat-service.js'

const router = express.Router()
const chatService = new ChatService()

router.post('/', async (request, response) => {
  try {
    const result = await chatService.handleChat(request.body || {})

    if (!result.success) {
      return response.status(result.error === 'message is required' ? 400 : 503).json({
        success: false,
        error: result.error,
      })
    }

    return response.json({
      success: true,
      response: result.response,
      fallback: result.fallback === true,
      agent: result.agent,
      topic: result.topic,
    })
  } catch (error) {
    console.error('Chat route error:', error)
    return response.status(500).json({
      success: false,
      error: 'The tutor service encountered an internal error',
    })
  }
})

export { router as chatRouter }
