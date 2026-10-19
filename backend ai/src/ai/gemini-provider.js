import { BaseAIProvider } from './base-provider.js'
import { config } from '../config.js'

const RETRY_DELAY_MS = 500

export class GeminiProviderError extends Error {
  constructor(message, code) {
    super(message)
    this.name = 'GeminiProviderError'
    this.code = code
  }
}

function isConnectionResetError(error) {
  for (let current = error; current; current = current.cause) {
    if (current.code === 'ECONNRESET' || /ECONNRESET|connection reset/i.test(current.message || '')) {
      return true
    }
  }

  return false
}

function isNetworkError(error) {
  if (isConnectionResetError(error)) return true
  if (error instanceof TypeError && /fetch failed|network error|failed to fetch/i.test(error.message)) return true

  for (let current = error; current; current = current.cause) {
    if (['EAI_AGAIN', 'ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT'].includes(current.code)) {
      return true
    }
  }

  return false
}

export class GeminiAIProvider extends BaseAIProvider {
  constructor() {
    super('gemini')
    this.apiKey = config.geminiApiKey || ''
    this.defaultModel = config.geminiModel || 'gemini-2.0-flash'
  }

  async checkAvailability() {
    return Boolean(this.apiKey && this.apiKey.trim())
  }

  async generateResponse(prompt, { maxOutputTokens = config.geminiMaxOutputTokens, timeoutMs = config.geminiRequestTimeoutMs } = {}) {
    if (!(await this.checkAvailability())) {
      return {
        success: false,
        error: 'Gemini provider is not configured. Set GEMINI_API_KEY in the backend environment.',
      }
    }

    const modelName = this.defaultModel.replace(/^models\//, '')
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(this.apiKey)}`

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), timeoutMs)
      let shouldRetry = false

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              maxOutputTokens,
            },
          }),
        })

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          if (response.status === 429) {
            throw new GeminiProviderError('Gemini is rate limited. Please wait a moment and try again.', 'RATE_LIMITED')
          }

          if (response.status >= 500 || payload?.error?.status === 'UNAVAILABLE') {
            if (attempt === 0) {
              shouldRetry = true
            } else {
              throw new GeminiProviderError('Gemini is temporarily unavailable. Please try again shortly.', 'SERVICE_UNAVAILABLE')
            }
          } else if (response.status === 401 || response.status === 403) {
            throw new GeminiProviderError('Gemini rejected its credentials. Check the backend GEMINI_API_KEY setting.', 'CONFIGURATION_ERROR')
          } else {
            throw new GeminiProviderError(`Gemini rejected the request (HTTP ${response.status}). Check the configured model and request.`, 'REQUEST_REJECTED')
          }
        } else {
          const payload = await response.json()
          const candidate = payload?.candidates?.[0]
          if (candidate?.finishReason === 'MAX_TOKENS') {
            throw new GeminiProviderError(
              'Gemini cut off this response at its output limit. Please ask for a shorter explanation or increase GEMINI_MAX_OUTPUT_TOKENS.',
              'RESPONSE_TRUNCATED'
            )
          }

          const text = candidate?.content?.parts
            ?.map((part) => part?.text || '')
            .join('')
            || ''

          if (!text.trim()) {
            throw new GeminiProviderError('Gemini returned an empty response. Please try again.', 'EMPTY_RESPONSE')
          }

          return text
        }
      } catch (error) {
        if (controller.signal.aborted || error?.name === 'AbortError') {
          throw new GeminiProviderError('Gemini took too long to respond. Please try again shortly.', 'TIMEOUT')
        }

        if (error instanceof GeminiProviderError) {
          throw error
        }

        if (isConnectionResetError(error)) {
          if (attempt === 0) {
            shouldRetry = true
          } else {
            throw new GeminiProviderError('The connection to Gemini was interrupted. Please try again shortly.', 'NETWORK_ERROR')
          }
        } else if (isNetworkError(error)) {
          throw new GeminiProviderError('Could not reach Gemini. Check the backend network and try again.', 'NETWORK_ERROR')
        } else {
          throw new GeminiProviderError('Gemini could not complete the request. Please try again.', 'PROVIDER_ERROR')
        }
      } finally {
        clearTimeout(timeout)
      }

      if (shouldRetry) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
      }
    }

    throw new GeminiProviderError('Gemini is temporarily unavailable. Please try again shortly.', 'SERVICE_UNAVAILABLE')
  }

  async generateStructuredResponse(prompt) {
    const textResponse = await this.generateResponse(prompt)
    if (typeof textResponse === 'string') {
      return { text: textResponse }
    }

    return textResponse
  }
}
