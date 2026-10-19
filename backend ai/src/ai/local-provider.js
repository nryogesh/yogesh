import { BaseAIProvider } from './base-provider.js'
import { config } from '../config.js'

export class LocalAIProvider extends BaseAIProvider {
  constructor() {
    super('local')
    this.baseUrl = config.localModelUrl.replace(/\/$/, '')
    this.model = config.localModelName || 'llama3.1:8b'
  }

  async checkAvailability() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(4000),
      })

      if (!response.ok) {
        return false
      }

      const payload = await response.json()
      const models = Array.isArray(payload?.models) ? payload.models : []
      const modelNames = models
        .map((model) => typeof model?.name === 'string' ? model.name : typeof model?.model === 'string' ? model.model : '')
        .filter(Boolean)

      if (modelNames.length === 0) {
        return false
      }

      if (!this.model || !this.model.trim()) {
        return true
      }

      return modelNames.some((name) => {
        const normalizedName = name.trim()
        return normalizedName === this.model || normalizedName.startsWith(`${this.model}:`) || normalizedName.startsWith(`${this.model}/`) || normalizedName.includes(`/${this.model}`)
      })
    } catch (error) {
      return false
    }
  }

  async generateResponse(prompt) {
    const available = await this.checkAvailability()
    if (!available) {
      return {
        success: false,
        error: `Ollama is running, but the configured model "${this.model}" is not available. Pull it with "ollama pull ${this.model}" or set LOCAL_MODEL_NAME to an installed model.`,
      }
    }

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      }),
    })

    if (!response.ok) {
      const detail = await response.text()
      throw new Error(`Local model request failed: ${detail}`)
    }

    const payload = await response.json()
    return payload?.message?.content || payload?.response || payload?.content || 'Local AI model responded without content.'
  }

  async generateStructuredResponse(prompt) {
    const textResponse = await this.generateResponse(prompt)
    if (typeof textResponse === 'string') {
      return { text: textResponse }
    }

    return textResponse
  }
}
