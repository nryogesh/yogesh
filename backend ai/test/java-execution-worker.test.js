import assert from 'node:assert/strict'
import test from 'node:test'
import { createServer } from 'node:http'
import express from 'express'
import {
  createJavaWorkerApp,
  evaluateJavaRequest,
  WorkerInputError,
} from '../src/worker/java-execution-worker.js'

const token = 'test-worker-token-that-is-long-enough-123456'
const request = {
  language: 'java',
  assignmentId: 'pf-assignment-1',
  source: 'class Solution { public int sum(int[] values) { return 0; } }',
  entrypoint: 'Solution.sum(int[])',
  testCases: [
    { visibility: 'sample', input: { values: [3, 5, 7] }, expected: 15 },
    { visibility: 'additional', input: { values: [] }, expected: 0 },
    { visibility: 'additional', input: { values: [-4, 1, 2] }, expected: -1 },
    { visibility: 'additional', input: { values: [0, 0, 0] }, expected: 0 },
  ],
  limits: { wallTimeMs: 8000, memoryMb: 128, outputBytes: 16000 },
}

async function withServer(run, options = {}) {
  const app = createJavaWorkerApp({ token, ...options })
  app.use(express.json())
  const server = createServer(app)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  try {
    await run(`http://127.0.0.1:${server.address().port}`)
  } finally {
    const closed = new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
    server.closeAllConnections()
    await closed
  }
}

function dockerSuccess(stdout = '') {
  return { exitCode: 0, stdout, stderr: '', timedOut: false, outputLimit: false, failedToStart: false }
}

test('worker rejects unsupported entrypoints and invalid source before invoking Docker', async () => {
  await assert.rejects(
    evaluateJavaRequest({ ...request, entrypoint: 'Solution.run(String)' }, { dockerCommand: async () => assert.fail('Docker must not run') }),
    WorkerInputError
  )
  await assert.rejects(
    evaluateJavaRequest({ ...request, source: 'x'.repeat(24001) }, { dockerCommand: async () => assert.fail('Docker must not run') }),
    WorkerInputError
  )
})

test('worker compiles and grades through constrained Docker arguments and cleans up', async () => {
  const commands = []
  let nonce = 0
  const dockerCommand = async (args) => {
    commands.push(args)
    if (args[0] === 'create') return dockerSuccess('abcdef123456\n')
    if (args[0] === 'exec' && args[2] === 'javac') return dockerSuccess()
    if (args[0] === 'exec' && args[2] === 'java') return dockerSuccess('user output\n__DSA_RESULT_test0__1111\n')
    return dockerSuccess()
  }
  const result = await evaluateJavaRequest(request, {
    dockerCommand,
    nonceFactory: () => `test${nonce++}`,
  })

  assert.deepEqual(result, { status: 'completed', results: [{ passed: true }, { passed: true }, { passed: true }, { passed: true }] })
  const create = commands.find(([command]) => command === 'create')
  assert.ok(create.includes('--network') && create.includes('none'))
  assert.ok(create.includes('--read-only'))
  assert.ok(create.includes('--cap-drop') && create.includes('ALL'))
  assert.ok(create.includes('--pids-limit') && create.includes('64'))
  assert.ok(create.includes('--memory') && create.includes('256m'))
  assert.ok(create.includes(JAVA_IMAGE_FOR_TEST))
  assert.ok(commands.some((args) => args[0] === 'exec' && args[2] === 'javac'))
  assert.ok(commands.some(([command]) => command === 'rm'))
})

const JAVA_IMAGE_FOR_TEST = 'eclipse-temurin:21-jdk-jammy'

test('worker returns safe compiler diagnostics and distinguishes runtime errors and timeouts', async () => {
  const compileFailure = await evaluateJavaRequest(request, {
    nonceFactory: () => 'compile',
    dockerCommand: async (args) => {
      if (args[0] === 'create') return dockerSuccess('abcdef123456')
      if (args[0] === 'exec' && args[2] === 'javac') return { ...dockerSuccess(), exitCode: 1, stderr: 'Solution.java:8: error: cannot find symbol' }
      return dockerSuccess()
    },
  })
  assert.deepEqual(compileFailure, { status: 'compile_error', diagnostics: [{ code: 'CANNOT_FIND_SYMBOL', line: 8 }] })

  const runtimeFailure = await evaluateJavaRequest(request, {
    nonceFactory: () => 'runtime',
    dockerCommand: async (args) => {
      if (args[0] === 'create') return dockerSuccess('abcdef123456')
      if (args[0] === 'exec' && args[2] === 'java') return { ...dockerSuccess(), exitCode: 23, stderr: 'private stack trace' }
      return dockerSuccess()
    },
  })
  assert.deepEqual(runtimeFailure, { status: 'runtime_error' })

  const timeout = await evaluateJavaRequest(request, {
    nonceFactory: () => 'timeout',
    dockerCommand: async (args) => {
      if (args[0] === 'create') return dockerSuccess('abcdef123456')
      if (args[0] === 'exec' && args[2] === 'javac') return { ...dockerSuccess(), timedOut: true }
      return dockerSuccess()
    },
  })
  assert.deepEqual(timeout, { status: 'timeout' })
})

test('worker preserves incorrect-answer results for the backend evaluator', async () => {
  const result = await evaluateJavaRequest(request, {
    nonceFactory: () => 'incorrect',
    dockerCommand: async (args) => {
      if (args[0] === 'create') return dockerSuccess('abcdef123456')
      if (args[0] === 'exec' && args[2] === 'java') return dockerSuccess('__DSA_RESULT_incorrect__1010\n')
      return dockerSuccess()
    },
  })

  assert.deepEqual(result, {
    status: 'completed',
    results: [{ passed: true }, { passed: false }, { passed: true }, { passed: false }],
  })
})

test('worker HTTP API requires a token and returns bounded evaluation errors', async () => {
  await withServer(async (baseUrl) => {
    const unauthorized = await fetch(`${baseUrl}/health`)
    assert.equal(unauthorized.status, 401)

    const health = await fetch(`${baseUrl}/health`, { headers: { Authorization: `Bearer ${token}` } })
    assert.equal(health.status, 200)
    assert.deepEqual(await health.json(), { available: true, reason: null })

    const invalid = await fetch(`${baseUrl}/evaluate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...request, assignmentId: 'unknown' }),
    })
    assert.equal(invalid.status, 400)
    assert.match((await invalid.json()).error, /does not support/)
  }, {
    dockerCommand: async () => dockerSuccess('Docker server'),
    evaluate: async (payload) => {
      if (payload.assignmentId !== request.assignmentId) throw new WorkerInputError('This Java worker does not support the requested assignment.')
      return { status: 'completed', results: request.testCases.map(() => ({ passed: true })) }
    },
  })
})

test('worker reports Docker unavailability rather than claiming health', async () => {
  await withServer(async (baseUrl) => {
    const health = await fetch(`${baseUrl}/health`, { headers: { Authorization: `Bearer ${token}` } })
    assert.equal(health.status, 503)
    assert.deepEqual(await health.json(), { available: false, reason: 'docker_daemon_unavailable' })
  }, {
    dockerCommand: async () => ({ ...dockerSuccess(), exitCode: 1 }),
  })
})
