import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import test from 'node:test'
import express from 'express'
import { createHealthRouter } from '../src/routes/health.js'
import { recordLiveGeneration } from '../src/utils/provider-status.js'

test('AI health distinguishes configured credentials from a live generation test', async () => {
  const app = express()
  app.use('/api/health', createHealthRouter(() => ({
    name: 'gemini',
    checkAvailability: async () => true,
  })))

  const server = createServer(app)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))

  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/health/ai`)
    const result = await response.json()

    assert.equal(response.status, 200)
    assert.equal(result.configured, true)
    assert.equal(result.configurationReady, true)
    assert.equal(result.liveGeneration, 'not_tested')
    assert.equal(result.ready, false)
    assert.match(result.label, /generation not verified/i)

    recordLiveGeneration({ success: true })
    const verifiedResponse = await fetch(`http://127.0.0.1:${server.address().port}/api/health/ai`)
    const verifiedResult = await verifiedResponse.json()
    assert.equal(verifiedResult.liveGeneration, 'verified')
    assert.equal(verifiedResult.readiness, 'not_checked')
    assert.equal(verifiedResult.ready, false)
    assert.ok(verifiedResult.liveGenerationCheckedAt)
  } finally {
    const closed = new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
    server.closeAllConnections()
    await closed
  }
})

test('health endpoints return a service error when provider initialization fails', async () => {
  const app = express()
  app.use('/api/health', createHealthRouter(() => {
    throw new Error('private initialization details')
  }))

  const server = createServer(app)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))

  try {
    for (const path of ['/', '/ai']) {
      const response = await fetch(`http://127.0.0.1:${server.address().port}/api/health${path}`)
      const result = await response.json()
      assert.equal(response.status, 503)
      assert.equal(result.success, false)
      assert.equal(result.status, 'error')
      assert.equal(result.error, 'AI provider status could not be determined')
      assert.doesNotMatch(JSON.stringify(result), /private initialization details|fallback/i)
    }
  } finally {
    const closed = new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
    server.closeAllConnections()
    await closed
  }
})
