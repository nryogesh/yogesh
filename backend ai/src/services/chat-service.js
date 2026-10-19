import { DsaTutorAgent } from '../agents/tutor-agent.js'
import { getPublicAssignmentContext } from './assignment-context.js'

export class ChatService {
  constructor(agent = new DsaTutorAgent()) {
    this.agent = agent
  }

  async handleChat(payload) {
    const message = typeof payload?.message === 'string' ? payload.message.trim() : ''
    if (!message) {
      return {
        success: false,
        error: 'message is required',
      }
    }

    const conversationHistory = Array.isArray(payload?.conversation_history)
      ? payload.conversation_history
      : Array.isArray(payload?.history)
        ? payload.history
        : []
    const assignmentContext = getPublicAssignmentContext(payload?.assignment_id || payload?.assignmentId)

    const result = await this.agent.respond({
      message,
      topic: assignmentContext?.topic || payload?.topic || 'Data Structures and Algorithms',
      difficulty: assignmentContext?.assignment.difficulty || payload?.difficulty || 'beginner',
      language: assignmentContext?.assignment.language || payload?.language || 'Java',
      userLevel: payload?.user_level || payload?.userLevel || 'beginner',
      conversationHistory,
      assignmentContext: assignmentContext?.assignment || null,
    })

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'AI provider is unavailable',
      }
    }

    return {
      success: true,
      response: result.response,
      fallback: result.fallback === true,
      agent: result.agent,
      topic: result.topic,
    }
  }
}
