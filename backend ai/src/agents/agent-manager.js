export class AgentManager {
  constructor() {
    this.agents = {
      dsa_tutor: 'dsa_tutor',
      problem_generator: 'problem_generator',
      hint_agent: 'hint_agent',
      code_review: 'code_review',
      progress_agent: 'progress_agent',
      learning_planner: 'learning_planner',
    }
  }

  getAgent(name) {
    if (!name || !this.agents[name]) {
      return 'dsa_tutor'
    }

    return this.agents[name]
  }
}
