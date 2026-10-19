export class BaseAIProvider {
  constructor(name) {
    this.name = name
  }

  async checkAvailability() {
    return false
  }

  async generateResponse(_prompt) {
    throw new Error('generateResponse must be implemented by a provider')
  }

  async generateStructuredResponse(_prompt) {
    throw new Error('generateStructuredResponse must be implemented by a provider')
  }
}
