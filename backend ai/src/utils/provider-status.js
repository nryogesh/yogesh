export function buildProviderStatus({ provider = 'local', available = false, fallback = false } = {}) {
  const mode = fallback ? 'fallback' : available ? 'ready' : 'unavailable'

  const labels = {
    fallback: 'Fallback mode active',
    ready: `${provider} ready`,
    unavailable: `${provider} unavailable`,
  }

  return {
    provider,
    available: Boolean(available),
    fallback,
    ready: Boolean(available) && !fallback,
    mode,
    label: labels[mode],
  }
}
