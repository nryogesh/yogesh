import assert from 'node:assert/strict'
import test from 'node:test'
import { readTutorChatResponse } from './tutor-chat-response.js'

test('chat API response preserves the complete assistant text unchanged', async () => {
  const responseText = 'Arrays have three properties:\n\n1. Fixed size.\n2. Same type.\n3. Indexed access.\n\n```java\nint[] values = {1, 2};\n```'
  const apiResponse = {
    ok: true,
    json: async () => ({ success: true, response: responseText, agent: 'dsa_tutor' }),
  }

  const data = await readTutorChatResponse(apiResponse)
  assert.equal(data.response, responseText)
})

test('chat API rejects malformed or unsuccessful responses rather than displaying an empty answer', async () => {
  await assert.rejects(
    readTutorChatResponse({ ok: true, json: async () => ({ success: true }) }),
    { message: 'The mentor could not respond' }
  )
  await assert.rejects(
    readTutorChatResponse({ ok: false, json: async () => ({ success: false, error: 'Gemini response was truncated.' }) }),
    { message: 'Gemini response was truncated.' }
  )
})
