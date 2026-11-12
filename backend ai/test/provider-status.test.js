import assert from 'node:assert/strict'
import test from 'node:test'
import { buildProviderStatus, recordLiveGeneration } from '../src/utils/provider-status.js'

test('provider status clearly marks fallback mode', () => {
  const status = buildProviderStatus({ provider: 'local', available: false, fallback: true })

  assert.equal(status.mode, 'fallback')
  assert.equal(status.ready, false)
  assert.match(status.label, /Fallback/)
})

test('provider status distinguishes configuration from verified live generation', () => {
  recordLiveGeneration({ success: false, code: 'REQUEST_REJECTED' })
  const status = buildProviderStatus({ provider: 'claude', available: true, fallback: false })

  assert.equal(status.mode, 'configured')
  assert.equal(status.configured, true)
  assert.equal(status.configurationReady, true)
  assert.equal(status.liveGeneration, 'not_tested')
  assert.equal(status.ready, false)
  assert.match(status.label, /generation not verified/i)
})

test('Gemini health separates its last generation result from current readiness', () => {
  recordLiveGeneration({ success: true })
  const status = buildProviderStatus({ provider: 'gemini', available: true })

  assert.equal(status.configured, true)
  assert.equal(status.liveGeneration, 'verified')
  assert.equal(status.liveGenerationReason, null)
  assert.equal(status.liveGenerationHttpStatus, null)
  assert.ok(status.liveGenerationCheckedAt)
  assert.equal(status.readiness, 'not_checked')
  assert.equal(status.ready, false)
  assert.match(status.label, /last gemini generation succeeded/i)

  recordLiveGeneration({ success: false, code: 'CONFIGURATION_ERROR', httpStatus: 403 })
  const failedStatus = buildProviderStatus({ provider: 'gemini', available: true })
  assert.equal(failedStatus.liveGeneration, 'failed')
  assert.equal(failedStatus.liveGenerationReason, 'credentials rejected')
  assert.equal(failedStatus.liveGenerationHttpStatus, 403)
  assert.equal(failedStatus.ready, false)
})
