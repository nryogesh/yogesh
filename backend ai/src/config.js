import 'dotenv/config'

function positiveInteger(value, fallback, maximum) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0
    ? Math.min(parsed, maximum)
    : fallback
}

export const config = {
  port: Number(process.env.BACKEND_PORT || 3000),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://0.0.0.0:3000',
  aiProvider: (process.env.AI_PROVIDER || (process.env.GEMINI_API_KEY ? 'gemini' : 'local')).toLowerCase(),
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  geminiRequestTimeoutMs: positiveInteger(process.env.GEMINI_REQUEST_TIMEOUT_MS, 25_000, 60_000),
  geminiMaxOutputTokens: Math.max(768, positiveInteger(process.env.GEMINI_MAX_OUTPUT_TOKENS, 2_048, 2_048)),
  localModelUrl: process.env.LOCAL_MODEL_URL || 'http://localhost:11434',
  localModelName: process.env.LOCAL_MODEL_NAME || 'llama3.1:8b',
}
