import { HintAgent } from '../agents/hint-agent.js'
import { buildHintInput, HintInputError } from '../models/hint.js'
import { getPublicAssignmentContext } from './assignment-context.js'

export class HintService {
  constructor(agent = new HintAgent()) {
    this.agent = agent
  }

  async provideHint(payload = {}) {
    const input = buildHintInput(payload)
    const assignmentContext = input.assignmentId
      ? getPublicAssignmentContext(input.assignmentId)
      : null
    if (input.assignmentId && !assignmentContext) {
      throw new HintInputError('Published assignment was not found')
    }

    return this.agent.provideHint({
      ...input,
      topic: assignmentContext?.topic || input.topic,
      difficulty: assignmentContext?.assignment.difficulty || input.difficulty,
      assignmentContext: assignmentContext?.assignment || null,
    })
  }
}