const FAILURE_REASONS = {
  CONFIGURATION_ERROR: 'credentials rejected',
  EMPTY_RESPONSE: 'empty response',
  MODEL_UNAVAILABLE: 'model unavailable',
  NETWORK_ERROR: 'network error',
  PROVIDER_ERROR: 'provider error',
  RATE_LIMITED: 'rate limited',
  REQUEST_REJECTED: 'request rejected',
  RESPONSE_TRUNCATED: 'response truncated',
  SERVICE_UNAVAILABLE: 'service unavailable',
  TIMEOUT: 'request timed out',
}

let liveGenerationStatus = {
  state: 'not_tested',
  reason: null,
  httpStatus: null,
  checkedAt: null,
}

export function recordLiveGeneration({ success, code = null, httpStatus = null } = {}) {
  liveGenerationStatus = success
    ? { state: 'verified', reason: null, httpStatus: null, checkedAt: new Date().toISOString() }
    : {
        state: 'failed',
        reason: FAILURE_REASONS[code] || 'generation failed',
        httpStatus: Number.isInteger(httpStatus) ? httpStatus : null,
        checkedAt: new Date().toISOString(),
      }
}

export function getLiveGenerationStatus() {
  return { ...liveGenerationStatus }
}

export function buildProviderStatus({ provider = 'local', available = false, fallback = false } = {}) {
  const safeProvider = typeof provider === 'string' && provider.trim() ? provider : 'local'
  const configured = Boolean(available)
  const liveGenerationStatus = safeProvider === 'gemini'
    ? getLiveGenerationStatus()
    : { state: 'not_tested', reason: null, httpStatus: null, checkedAt: null }
  const mode = fallback ? 'fallback' : configured ? 'configured' : 'unavailable'

  const labels = {
    fallback: 'Fallback mode active',
    configured: liveGenerationStatus.state === 'verified'
      ? `Last ${safeProvider} generation succeeded`
      : liveGenerationStatus.state === 'failed'
        ? `Last ${safeProvider} generation failed: ${liveGenerationStatus.reason}`
        : `${safeProvider} configured; live generation not verified`,
    unavailable: `${safeProvider} unavailable`,
  }

  return {
    provider: safeProvider,
    available: configured,
    configured,
    configurationReady: configured,
    liveGeneration: liveGenerationStatus.state,
    liveGenerationReason: liveGenerationStatus.reason,
    liveGenerationHttpStatus: liveGenerationStatus.httpStatus,
    liveGenerationCheckedAt: liveGenerationStatus.checkedAt,
    fallback,
    readiness: 'not_checked',
    ready: false,
    mode,
    label: labels[mode],
  }
}
