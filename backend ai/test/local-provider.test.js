import assert from 'node:assert/strict'
import test from 'node:test'

import { LocalAIProvider } from '../src/ai/local-provider.js'

test('local provider reports the configured model as unavailable when not installed', async () => {
  const provider = new LocalAIProvider()
  provider.baseUrl = 'http://127.0.0.1:11434'
  provider.model = 'missing-model:latest'

  global.fetch = async () => ({
    ok: true,
    json: async () => ({
      models: [{ name: 'llama3.1:8b' }],
    }),
  })

  const available = await provider.checkAvailability()
  assert.equal(available, false)
})
