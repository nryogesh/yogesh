import { BaseAIProvider } from './base-provider.js'
import { config } from '../config.js'
import { recordLiveGeneration } from '../utils/provider-status.js'
import { performance } from 'node:perf_hooks'

const RETRY_DELAY_MS = 500

export class GeminiProviderError extends Error {
  constructor(message, code, { httpStatus = null, providerStatus = null } = {}) {
    super(message)
    this.name = 'GeminiProviderError'
    this.code = code
    this.httpStatus = httpStatus
    this.providerStatus = providerStatus
  }
}

function getProviderStatus(payload) {
  const status = payload?.error?.status
  return typeof status === 'string' && /^[A-Z][A-Z0-9_]{0,63}$/.test(status)
    ? status
    : null
}

function logGenerationTiming({ category, httpStatus, headersMs, bodyMs, totalMs }) {
  const log = category === 'SUCCESS' ? console.info : console.warn
  log('[ai] Gemini generation timing', JSON.stringify({
    category,
    httpStatus,
    headersMs,
    bodyMs,
    totalMs,
  }))
}

function getSafeHttpStatus(status) {
  return Number.isInteger(status) && status >= 100 && status <= 599 ? status : null
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
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent`

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const startedAt = performance.now()
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), timeoutMs)
      let shouldRetry = false
      let headersMs = null
      let bodyMs = null
      let httpStatus = null
      let diagnosticCategory = 'PROVIDER_ERROR'

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey,
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
        headersMs = Math.round(performance.now() - startedAt)
        httpStatus = getSafeHttpStatus(response.status)

        let payload
        const bodyStartedAt = performance.now()
        try {
          if (response.ok) {
            payload = await response.json()
          } else {
            payload = await response.json().catch((error) => {
              if (controller.signal.aborted) throw error
              return {}
            })
          }
        } finally {
          bodyMs = Math.round(performance.now() - bodyStartedAt)
        }

        if (!response.ok) {
          const providerStatus = getProviderStatus(payload)
          if (response.status === 429) {
            throw new GeminiProviderError(
              'Gemini is rate limited. Please wait a moment and try again.',
              'RATE_LIMITED',
              { httpStatus: response.status, providerStatus }
            )
          }

          if (response.status >= 500 || payload?.error?.status === 'UNAVAILABLE') {
            if (attempt === 0) {
              shouldRetry = true
              diagnosticCategory = 'SERVICE_UNAVAILABLE'
            } else {
              throw new GeminiProviderError(
                'Gemini is temporarily unavailable. Please try again shortly.',
                'SERVICE_UNAVAILABLE',
                { httpStatus: response.status, providerStatus }
              )
            }
          } else if (response.status === 401 || response.status === 403) {
            throw new GeminiProviderError(
              'Gemini rejected its credentials. Check the backend GEMINI_API_KEY setting.',
              'CONFIGURATION_ERROR',
              { httpStatus: response.status, providerStatus }
            )
          } else if (response.status === 404) {
            throw new GeminiProviderError(
              'Gemini could not find the configured model. Check GEMINI_MODEL.',
              'MODEL_UNAVAILABLE',
              { httpStatus: response.status, providerStatus }
            )
          } else {
            throw new GeminiProviderError(
              `Gemini rejected the request (HTTP ${response.status}). Check the configured model and request.`,
              'REQUEST_REJECTED',
              { httpStatus: response.status, providerStatus }
            )
          }
        } else {
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

          recordLiveGeneration({ success: true })
          diagnosticCategory = 'SUCCESS'
          return text
        }
      } catch (error) {
        if (controller.signal.aborted || error?.name === 'AbortError') {
          const failure = new GeminiProviderError('Gemini took too long to respond. Please try again shortly.', 'TIMEOUT')
          diagnosticCategory = failure.code
          recordLiveGeneration({ success: false, code: failure.code })
          throw failure
        }

        if (error instanceof GeminiProviderError) {
          diagnosticCategory = error.code
          if (!shouldRetry) {
            recordLiveGeneration({
              success: false,
              code: error.code,
              httpStatus: error.httpStatus,
            })
          }
          throw error
        }

        if (isConnectionResetError(error)) {
          if (attempt === 0) {
            shouldRetry = true
            diagnosticCategory = 'NETWORK_ERROR'
          } else {
            const failure = new GeminiProviderError('The connection to Gemini was interrupted. Please try again shortly.', 'NETWORK_ERROR')
            diagnosticCategory = failure.code
            recordLiveGeneration({ success: false, code: failure.code })
            throw failure
          }
        } else if (isNetworkError(error)) {
          const failure = new GeminiProviderError('Could not reach Gemini. Check the backend network and try again.', 'NETWORK_ERROR')
          diagnosticCategory = failure.code
          recordLiveGeneration({ success: false, code: failure.code })
          throw failure
        } else {
          const failure = new GeminiProviderError('Gemini could not complete the request. Please try again.', 'PROVIDER_ERROR')
          diagnosticCategory = failure.code
          recordLiveGeneration({ success: false, code: failure.code })
          throw failure
        }
      } finally {
        clearTimeout(timeout)
        logGenerationTiming({
          category: diagnosticCategory,
          httpStatus,
          headersMs,
          bodyMs,
          totalMs: Math.round(performance.now() - startedAt),
        })
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
