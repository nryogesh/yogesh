import assert from 'node:assert/strict'
import test from 'node:test'

import { config } from '../src/config.js'
import { GeminiAIProvider, GeminiProviderError } from '../src/ai/gemini-provider.js'

test('gemini provider checks configuration before sending requests', async () => {
  const provider = new GeminiAIProvider()
  provider.apiKey = ''

  assert.equal(await provider.checkAvailability(), false)
})

test('gemini provider extracts text from a Gemini response payload', async () => {
  const provider = new GeminiAIProvider()
  provider.apiKey = 'test-key'
  const originalFetch = global.fetch
  let requestBody
  let requestEndpoint
  let requestHeaders
  let responseJsonCalls = 0
  global.fetch = async (endpoint, options) => {
    requestEndpoint = endpoint
    requestHeaders = options.headers
    requestBody = JSON.parse(options.body)
    return {
      ok: true,
      json: async () => {
        responseJsonCalls += 1
        if (responseJsonCalls > 1) throw new TypeError('Response body has already been consumed')
        return {
          candidates: [{
            content: {
              parts: [{ text: 'Binary search narrows the range each step.' }],
            },
          }],
        }
      },
    }
  }
  try {
    const result = await provider.generateResponse('Explain binary search')
    assert.equal(result, 'Binary search narrows the range each step.')
    assert.equal(requestBody.generationConfig.maxOutputTokens, config.geminiMaxOutputTokens)
    assert.match(requestEndpoint, /:generateContent$/)
    assert.doesNotMatch(requestEndpoint, /test-key|[?&]key=/)
    assert.equal(requestHeaders['x-goog-api-key'], 'test-key')
    assert.equal(responseJsonCalls, 1)
  } finally {
    global.fetch = originalFetch
  }
})

test('gemini provider applies per-request token and timeout limits', async () => {
  const provider = new GeminiAIProvider()
  provider.apiKey = 'test-key'
  const originalFetch = global.fetch
  const originalSetTimeout = globalThis.setTimeout
  let requestBody
  let timeoutDelay

  globalThis.setTimeout = (callback, delay, ...args) => {
    if (delay === 18_000) timeoutDelay = delay
    return originalSetTimeout(callback, delay, ...args)
  }
  global.fetch = async (_endpoint, options) => {
    requestBody = JSON.parse(options.body)
    return {
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'A concise generated problem.' }] } }],
      }),
    }
  }

  try {
    await provider.generateResponse('Generate a short problem', { maxOutputTokens: 1536, timeoutMs: 18_000 })
    assert.equal(requestBody.generationConfig.maxOutputTokens, 1536)
    assert.equal(timeoutDelay, 18_000)
  } finally {
    global.fetch = originalFetch
    globalThis.setTimeout = originalSetTimeout
  }
})

test('gemini provider retries one unavailable response and returns the successful response', async () => {
  const provider = new GeminiAIProvider()
  provider.apiKey = 'test-key'
  const originalFetch = global.fetch
  let requests = 0

  global.fetch = async () => {
    requests += 1
    if (requests === 1) {
      return {
        ok: false,
        status: 503,
        json: async () => ({
          error: {
            status: 'UNAVAILABLE',
            message: 'The service is temporarily unavailable.',
          },
        }),
      }
    }

    return {
      ok: true,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{ text: 'Binary search repeatedly halves a sorted range.' }],
          },
        }],
      }),
    }
  }

  try {
    const result = await provider.generateResponse('Explain binary search')
    assert.equal(result, 'Binary search repeatedly halves a sorted range.')
    assert.equal(requests, 2)
  } finally {
    global.fetch = originalFetch
  }
})

test('gemini provider returns a clean temporary-unavailable error after two unavailable responses', async () => {
  const provider = new GeminiAIProvider()
  provider.apiKey = 'test-key'
  const originalFetch = global.fetch
  let requests = 0

  global.fetch = async () => {
    requests += 1
    return {
      ok: false,
      status: 503,
      json: async () => ({
        error: {
          status: 'UNAVAILABLE',
          message: 'The raw Google error must not reach the student.',
        },
      }),
    }
  }

  try {
    await assert.rejects(
      provider.generateResponse('Explain binary search'),
      { message: 'Gemini is temporarily unavailable. Please try again shortly.', code: 'SERVICE_UNAVAILABLE' }
    )
    assert.equal(requests, 2)
  } finally {
    global.fetch = originalFetch
  }
})

test('gemini provider retries one connection reset and returns the successful response', async () => {
  const provider = new GeminiAIProvider()
  provider.apiKey = 'test-key'
  const originalFetch = global.fetch
  let requests = 0

  global.fetch = async () => {
    requests += 1
    if (requests === 1) {
      const cause = Object.assign(new Error('read ECONNRESET'), { code: 'ECONNRESET' })
      throw new TypeError('fetch failed', { cause })
    }

    return {
      ok: true,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{ text: 'Binary search halves the remaining sorted range.' }],
          },
        }],
      }),
    }
  }

  try {
    const result = await provider.generateResponse('Explain binary search')
    assert.equal(result, 'Binary search halves the remaining sorted range.')
    assert.equal(requests, 2)
  } finally {
    global.fetch = originalFetch
  }
})

test('gemini provider returns a clean error after two connection resets', async () => {
  const provider = new GeminiAIProvider()
  provider.apiKey = 'test-key'
  const originalFetch = global.fetch
  let requests = 0

  global.fetch = async () => {
    requests += 1
    const cause = Object.assign(new Error('read ECONNRESET'), { code: 'ECONNRESET' })
    throw new TypeError('fetch failed', { cause })
  }

  try {
    await assert.rejects(
      provider.generateResponse('Explain binary search'),
      { message: 'The connection to Gemini was interrupted. Please try again shortly.', code: 'NETWORK_ERROR' }
    )
    assert.equal(requests, 2)
  } finally {
    global.fetch = originalFetch
  }
})

test('gemini provider reports a clean timeout without retrying', async () => {
  const provider = new GeminiAIProvider()
  provider.apiKey = 'test-key'
  const originalFetch = global.fetch
  const originalSetTimeout = globalThis.setTimeout
  const originalWarn = console.warn
  let requests = 0
  let timeoutDelay
  let timingLog

  console.warn = (...values) => { timingLog = values }

  globalThis.setTimeout = (callback, delay, ...args) => {
    if (delay === config.geminiRequestTimeoutMs) {
      timeoutDelay = delay
      return originalSetTimeout(callback, 0, ...args)
    }
    return originalSetTimeout(callback, delay, ...args)
  }
  global.fetch = async (_endpoint, { signal }) => {
    requests += 1
    await new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => {
        const error = new Error('This operation was aborted')
        error.name = 'AbortError'
        reject(error)
      }, { once: true })
    })
  }

  try {
    await assert.rejects(
      provider.generateResponse('Explain binary search'),
      { message: 'Gemini took too long to respond. Please try again shortly.', code: 'TIMEOUT' }
    )
    assert.equal(timeoutDelay, config.geminiRequestTimeoutMs)
    assert.equal(requests, 1)
    assert.equal(timingLog[0], '[ai] Gemini generation timing')
    const timing = JSON.parse(timingLog[1])
    assert.equal(timing.category, 'TIMEOUT')
    assert.equal(timing.headersMs, null)
    assert.equal(timing.bodyMs, null)
    assert.equal(timing.httpStatus, null)
    assert.ok(timing.totalMs >= 0)
  } finally {
    global.fetch = originalFetch
    globalThis.setTimeout = originalSetTimeout
    console.warn = originalWarn
  }
})

test('gemini provider timing separates delayed headers from body parsing', async () => {
  const provider = new GeminiAIProvider()
  provider.apiKey = 'test-key'
  const originalFetch = global.fetch
  const originalInfo = console.info
  let timingLog

  console.info = (...values) => { timingLog = values }
  global.fetch = async () => {
    await new Promise((resolve) => setTimeout(resolve, 25))
    return {
      ok: true,
      status: 200,
      json: async () => {
        await new Promise((resolve) => setTimeout(resolve, 15))
        return { candidates: [{ content: { parts: [{ text: 'A delayed response.' }] } }] }
      },
    }
  }

  try {
    assert.equal(
      await provider.generateResponse('Explain arrays', { timeoutMs: 500 }),
      'A delayed response.'
    )
    assert.equal(timingLog[0], '[ai] Gemini generation timing')
    const timing = JSON.parse(timingLog[1])
    assert.equal(timing.category, 'SUCCESS')
    assert.equal(timing.httpStatus, 200)
    assert.ok(timing.headersMs >= 15)
    assert.ok(timing.bodyMs >= 10)
    assert.ok(timing.totalMs >= timing.headersMs + timing.bodyMs)
    assert.deepEqual(Object.keys(timing).sort(), ['bodyMs', 'category', 'headersMs', 'httpStatus', 'totalMs'])
  } finally {
    global.fetch = originalFetch
    console.info = originalInfo
  }
})

test('gemini provider times body parsing out and records body duration', async () => {
  const provider = new GeminiAIProvider()
  provider.apiKey = 'test-key'
  const originalFetch = global.fetch
  const originalWarn = console.warn
  let timingLog

  console.warn = (...values) => { timingLog = values }
  global.fetch = async (_endpoint, { signal }) => ({
    ok: true,
    status: 200,
    json: async () => new Promise((_resolve, reject) => {
      const abort = () => {
        const error = new Error('This operation was aborted')
        error.name = 'AbortError'
        reject(error)
      }
      if (signal.aborted) {
        abort()
      } else {
        signal.addEventListener('abort', abort, { once: true })
      }
    }),
  })

  try {
    await assert.rejects(
      provider.generateResponse('Explain arrays', { timeoutMs: 30 }),
      { code: 'TIMEOUT' }
    )
    assert.equal(timingLog[0], '[ai] Gemini generation timing')
    const timing = JSON.parse(timingLog[1])
    assert.equal(timing.category, 'TIMEOUT')
    assert.equal(timing.httpStatus, 200)
    assert.ok(Number.isInteger(timing.headersMs))
    assert.ok(timing.bodyMs >= 15)
    assert.ok(timing.totalMs >= timing.headersMs + timing.bodyMs)
    assert.deepEqual(Object.keys(timing).sort(), ['bodyMs', 'category', 'headersMs', 'httpStatus', 'totalMs'])
  } finally {
    global.fetch = originalFetch
    console.warn = originalWarn
  }
})

test('gemini provider does not retry a rate-limited request', async () => {
  const provider = new GeminiAIProvider()
  provider.apiKey = 'test-key'
  const originalFetch = global.fetch
  let requests = 0
  let warning = ''
  const originalWarn = console.warn
  console.warn = (...values) => { warning = values.join(' ') }
  global.fetch = async () => {
    requests += 1
    return {
      ok: false,
      status: 429,
      json: async () => ({
        error: {
          status: 'RESOURCE_EXHAUSTED',
          message: 'private provider detail',
        },
      }),
    }
  }

  try {
    await assert.rejects(
      provider.generateResponse('Explain binary search'),
      (error) => error instanceof GeminiProviderError &&
        error.code === 'RATE_LIMITED' &&
        error.httpStatus === 429 &&
        error.providerStatus === 'RESOURCE_EXHAUSTED' &&
        error.message.includes('wait a moment') &&
        !error.message.includes('private provider detail')
    )
    assert.equal(requests, 1)
    assert.match(warning, /RATE_LIMITED/)
    assert.match(warning, /"httpStatus":429/)
    assert.doesNotMatch(warning, /test-key|private provider detail|Explain binary search|RESOURCE_EXHAUSTED/)
  } finally {
    global.fetch = originalFetch
    console.warn = originalWarn
  }
})

test('gemini provider rejects responses cut off by the output token limit', async () => {
  const provider = new GeminiAIProvider()
  provider.apiKey = 'test-key'
  const originalFetch = global.fetch
  global.fetch = async () => ({
    ok: true,
    json: async () => ({
      candidates: [{
        finishReason: 'MAX_TOKENS',
        content: { parts: [{ text: 'An incomplete answer' }] },
      }],
    }),
  })

  try {
    await assert.rejects(
      provider.generateResponse('Explain arrays'),
      (error) => error.code === 'RESPONSE_TRUNCATED' &&
        error.message.includes('cut off') &&
        error.message.includes('GEMINI_MAX_OUTPUT_TOKENS')
    )
  } finally {
    global.fetch = originalFetch
  }
})

test('gemini provider retries a service error at most once', async () => {
  const provider = new GeminiAIProvider()
  provider.apiKey = 'test-key'
  const originalFetch = global.fetch
  let requests = 0
  global.fetch = async () => {
    requests += 1
    return { ok: false, status: 503, json: async () => ({ error: { status: 'UNAVAILABLE' } }) }
  }

  try {
    await assert.rejects(
      provider.generateResponse('Explain binary search'),
      { code: 'SERVICE_UNAVAILABLE' }
    )
    assert.equal(requests, 2)
  } finally {
    global.fetch = originalFetch
  }
})

test('gemini provider reports credential errors without retrying or echoing provider details', async () => {
  const provider = new GeminiAIProvider()
  provider.apiKey = 'test-key'
  const originalFetch = global.fetch
  let requests = 0
  global.fetch = async () => {
    requests += 1
    return { ok: false, status: 403, json: async () => ({ error: { message: 'sensitive provider detail' } }) }
  }

  try {
    await assert.rejects(
      provider.generateResponse('Explain binary search'),
      (error) => error.code === 'CONFIGURATION_ERROR' &&
        error.message.includes('GEMINI_API_KEY') &&
        !error.message.includes('sensitive provider detail')
    )
    assert.equal(requests, 1)
  } finally {
    global.fetch = originalFetch
  }
})

test('gemini provider reports unavailable models without exposing provider details', async () => {
  const provider = new GeminiAIProvider()
  provider.apiKey = 'test-key'
  const originalFetch = global.fetch
  let requests = 0
  global.fetch = async () => {
    requests += 1
    return { ok: false, status: 404, json: async () => ({ error: { message: 'private model detail' } }) }
  }

  try {
    await assert.rejects(
      provider.generateResponse('Explain binary search'),
      (error) => error.code === 'MODEL_UNAVAILABLE' &&
        error.httpStatus === 404 &&
        error.message.includes('GEMINI_MODEL') &&
        !error.message.includes('private model detail')
    )
    assert.equal(requests, 1)
  } finally {
    global.fetch = originalFetch
  }
})

test('gemini provider does not retry other HTTP errors', async () => {
  const provider = new GeminiAIProvider()
  provider.apiKey = 'test-key'
  const originalFetch = global.fetch
  let requests = 0

  global.fetch = async () => {
    requests += 1
    return {
      ok: false,
      status: 400,
      json: async () => ({
        error: {
          status: 'INVALID_ARGUMENT',
          message: 'Invalid request.',
        },
      }),
    }
  }

  try {
    await assert.rejects(
      provider.generateResponse('Explain binary search'),
      { message: 'Gemini rejected the request (HTTP 400). Check the configured model and request.', code: 'REQUEST_REJECTED' }
    )
    assert.equal(requests, 1)
  } finally {
    global.fetch = originalFetch
  }
})
