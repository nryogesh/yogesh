import 'dotenv/config'

const key = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY : ''
const model = process.env.GEMINI_MODEL ? process.env.GEMINI_MODEL : 'gemini-2.0-flash'
const hasKey = Boolean(key && key.trim())

console.log('HAS_GEMINI_KEY=' + hasKey)
console.log('GEMINI_MODEL=' + model)

if (!hasKey) {
  console.log('HTTP_STATUS=SKIP')
  console.log('RESPONSE_PREVIEW=Missing GEMINI_API_KEY')
  process.exit(0)
}

const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`
const response = await fetch(endpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: 'Explain binary search in two sentences.' }] }],
  }),
})

const raw = await response.text()
const preview = raw.slice(0, 400).replace(/\s+/g, ' ')
const safePreview = preview
  .replace(/(key=)[^&\s]+/gi, '$1[REDACTED]')
  .replace(/(https?:\/\/[^\s]+)/gi, '[REDACTED_URL]')
  .replace(/(Authorization\s*:\s*)[^\n\r]+/gi, '$1[REDACTED]')

console.log('HTTP_STATUS=' + response.status)
console.log('RESPONSE_PREVIEW=' + safePreview)
