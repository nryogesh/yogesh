import 'dotenv/config'
import { GoogleGenAI } from '@google/genai'

const key = process.env.GEMINI_API_KEY
const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash'

if (!key || !key.trim()) {
  console.log('[GEMINI ERROR]')
  console.log('name: MISSING_ENV')
  console.log('status: missing')
  console.log('code: missing')
  console.log('message: GEMINI_API_KEY missing')
  process.exit(0)
}

try {
  const ai = new GoogleGenAI({ apiKey: key })
  const response = await ai.models.generateContent({
    model,
    contents: 'Explain binary search in 2 sentences.',
  })

  const text = response?.text || response?.candidates?.[0]?.content?.parts?.map((part) => part?.text || '').join('') || ''
  console.log('HTTP_STATUS=200')
  console.log('MODEL=' + model)
  console.log('RESPONSE_PREVIEW=' + text.slice(0, 220).replace(/\s+/g, ' '))
} catch (error) {
  const cause = error?.cause || {}
  const response = error?.response || cause?.response || {}
  const body = response?.body || cause?.body || {}
  const safeBody = typeof body === 'string' ? body.slice(0, 600) : JSON.stringify(body).slice(0, 600)

  console.log('[GEMINI ERROR]')
  console.log('name: ' + (error?.name || cause?.name || 'unknown'))
  console.log('status: ' + (error?.status || cause?.status || 'unknown'))
  console.log('code: ' + (error?.code || cause?.code || 'unknown'))
  console.log('message: ' + (error?.message || cause?.message || 'unknown'))
  console.log('statusText: ' + (error?.statusText || cause?.statusText || 'unknown'))
  console.log('responseStatus: ' + (response?.status || 'unknown'))
  if (safeBody && safeBody !== '{}') {
    console.log('responseBody: ' + safeBody)
  }
}
