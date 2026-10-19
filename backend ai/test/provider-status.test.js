import assert from 'node:assert/strict'
import test from 'node:test'
import { buildProviderStatus } from '../src/utils/provider-status.js'

test('provider status clearly marks fallback mode', () => {
  const status = buildProviderStatus({ provider: 'local', available: false, fallback: true })

  assert.equal(status.mode, 'fallback')
  assert.equal(status.ready, false)
  assert.match(status.label, /Fallback/)
})

test('provider status marks a live provider as ready', () => {
  const status = buildProviderStatus({ provider: 'claude', available: true, fallback: false })

  assert.equal(status.mode, 'ready')
  assert.equal(status.ready, true)
  assert.match(status.label, /ready/i)
})
