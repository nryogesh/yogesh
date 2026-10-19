import { BaseAIProvider } from './base-provider.js'
import { config } from '../config.js'

export class ClaudeAIProvider extends BaseAIProvider {
  constructor() {
    super('claude')
    this.apiKey = config.anthropicApiKey
    this.defaultModel = 'claude-3-haiku-20240307'
  }

  async checkAvailability() {
    return Boolean(this.apiKey && this.apiKey.trim())
  }

  async generateResponse(prompt) {
    if (!(await this.checkAvailability())) {
      return {
        success: false,
        error: 'Claude provider is not configured. Set ANTHROPIC_API_KEY in the backend environment.',
      }
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.defaultModel,
        max_tokens: 700,
        system: 'You are a patient DSA mentor. Teach step-by-step, use simple explanations, ask guiding questions, and do not reveal full solutions immediately unless asked explicitly.',
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const detail = await response.text()
      throw new Error(`Claude request failed: ${detail}`)
    }

    const payload = await response.json()
    const text = payload?.content?.[0]?.text || 'Claude returned an empty response.'
    return text
  }

  async generateStructuredResponse(prompt) {
    const textResponse = await this.generateResponse(prompt)
    if (typeof textResponse === 'string') {
      return { text: textResponse }
    }

    return textResponse
  }
}
