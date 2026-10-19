import { ProblemGeneratorAgent } from '../agents/problem-agent.js'
import { buildProblemInput } from '../models/problem.js'

export class ProblemService {
  constructor(agent = new ProblemGeneratorAgent()) {
    this.agent = agent
  }

  async generateProblem(payload = {}) {
    const problemInput = buildProblemInput(payload)

    return this.agent.generate({
      topic: problemInput.topic,
      difficulty: problemInput.difficulty,
      userLevel: problemInput.user_level,
    })
  }
}
