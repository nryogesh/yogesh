export class HintInputError extends Error {}

function normalizeChoice(value, field, fallback, choices) {
  if (value === undefined) return fallback
  if (typeof value !== 'string' || !choices.includes(value.trim().toLowerCase())) {
    throw new HintInputError(`${field} must be one of: ${choices.join(', ')}`)
  }

  return value.trim().toLowerCase()
}

export function buildHintInput(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new HintInputError('Request body must be a JSON object')
  }

  const topic = input.topic === undefined ? 'Binary Search' : input.topic
  if (typeof topic !== 'string' || !topic.trim() || topic.trim().length > 80) {
    throw new HintInputError('topic must be between 1 and 80 characters')
  }

  const conversationHistory = input.conversation_history ?? input.conversationHistory ?? []
  if (!Array.isArray(conversationHistory)) {
    throw new HintInputError('conversation_history must be an array')
  }

  const history = conversationHistory.slice(-8).map((message) => {
    if (
      !message ||
      !['user', 'assistant'].includes(message.role) ||
      typeof message.content !== 'string' ||
      message.content.length > 2000
    ) {
      throw new HintInputError('conversation_history contains an invalid message')
    }

    return { role: message.role, content: message.content }
  })

  const assignmentId = input.assignment_id ?? input.assignmentId
  if (assignmentId !== undefined && (
    typeof assignmentId !== 'string' ||
    !assignmentId.trim() ||
    assignmentId.trim().length > 80
  )) {
    throw new HintInputError('assignment_id must be a string between 1 and 80 characters')
  }
  const hintStage = input.hint_stage ?? input.hintStage ?? 1
  if (!Number.isInteger(hintStage) || hintStage < 1 || hintStage > 3) {
    throw new HintInputError('hint_stage must be an integer from 1 to 3')
  }

  return {
    topic: topic.trim(),
    difficulty: normalizeChoice(input.difficulty, 'difficulty', 'beginner', ['beginner', 'intermediate', 'advanced']),
    conversationHistory: history,
    assignmentId: assignmentId?.trim(),
    hintStage,
  }
}