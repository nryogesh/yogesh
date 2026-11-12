import assert from 'node:assert/strict'
import test from 'node:test'
import { authenticateDemoUser } from './demo-auth.js'

const credentials = { userId: 'demo', password: 'Demo@123' }

test('demo authentication accepts the configured credentials exactly', () => {
  assert.equal(authenticateDemoUser('demo', 'Demo@123', credentials), true)
  assert.equal(authenticateDemoUser(' demo ', 'Demo@123', credentials), true)
})

test('demo authentication rejects empty and incorrect credentials', () => {
  assert.equal(authenticateDemoUser('', 'Demo@123', credentials), false)
  assert.equal(authenticateDemoUser('demo', '', credentials), false)
  assert.equal(authenticateDemoUser('other', 'Demo@123', credentials), false)
  assert.equal(authenticateDemoUser('demo', 'wrong', credentials), false)
})
