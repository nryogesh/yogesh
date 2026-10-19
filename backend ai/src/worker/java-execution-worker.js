import { randomBytes, timingSafeEqual } from 'node:crypto'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'
import express from 'express'

const JAVA_IMAGE = 'eclipse-temurin:21-jdk-jammy'
const MAX_SOURCE_BYTES = 24000
const MAX_CASES = 16
const MAX_WALL_TIME_MS = 8000
const MAX_MEMORY_MB = 256
const MAX_OUTPUT_BYTES = 16000

export class WorkerInputError extends Error {}

export class WorkerUnavailableError extends Error {
  constructor(code = 'SANDBOX_UNAVAILABLE') {
    super('The isolated Java worker is unavailable.')
    this.code = code
  }
}

export function runDockerCommand(args, { timeoutMs = 5000, maxOutputBytes = MAX_OUTPUT_BYTES } = {}) {
  return new Promise((resolve) => {
    let stdout = ''
    let stderr = ''
    let outputBytes = 0
    let timedOut = false
    let outputLimit = false
    const child = spawn('docker', args, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
    const timeout = setTimeout(() => {
      timedOut = true
      child.kill('SIGKILL')
    }, timeoutMs)

    const collect = (target) => (chunk) => {
      outputBytes += chunk.length
      if (outputBytes > maxOutputBytes) {
        outputLimit = true
        child.kill('SIGKILL')
        return
      }
      if (target === 'stdout') stdout += chunk.toString('utf8')
      else stderr += chunk.toString('utf8')
    }

    child.stdout.on('data', collect('stdout'))
    child.stderr.on('data', collect('stderr'))
    child.on('error', () => {
      clearTimeout(timeout)
      resolve({ exitCode: null, stdout, stderr, timedOut, outputLimit, failedToStart: true })
    })
    child.on('close', (exitCode) => {
      clearTimeout(timeout)
      resolve({ exitCode, stdout, stderr, timedOut, outputLimit, failedToStart: false })
    })
  })
}

function validatedCases(request) {
  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    throw new WorkerInputError('Request body must be a JSON object.')
  }
  if (request.language !== 'java' || request.assignmentId !== 'pf-assignment-1') {
    throw new WorkerInputError('This Java worker does not support the requested assignment.')
  }
  if (request.entrypoint !== 'Solution.sum(int[])') {
    throw new WorkerInputError('The requested Java entrypoint is not supported.')
  }
  if (typeof request.source !== 'string' || !request.source.trim() || Buffer.byteLength(request.source, 'utf8') > MAX_SOURCE_BYTES) {
    throw new WorkerInputError('Java source must contain 1 to 24000 UTF-8 bytes.')
  }
  if (!Array.isArray(request.testCases) || request.testCases.length < 1 || request.testCases.length > MAX_CASES) {
    throw new WorkerInputError('The evaluation case list is invalid.')
  }

  const cases = request.testCases.map((testCase) => {
    if (
      !['sample', 'additional'].includes(testCase?.visibility) ||
      !Array.isArray(testCase?.input?.values) ||
      testCase.input.values.length > 100000 ||
      !testCase.input.values.every((value) => Number.isInteger(value) && value >= -2147483648 && value <= 2147483647) ||
      !Number.isInteger(testCase.expected) ||
      testCase.expected < -2147483648 ||
      testCase.expected > 2147483647
    ) {
      throw new WorkerInputError('The evaluation case data is invalid.')
    }

    return {
      values: testCase.input.values,
      expected: testCase.expected,
    }
  })

  return { source: request.source, cases, wallTimeMs: request.limits?.wallTimeMs }
}

function javaArray(values) {
  return `new int[]{${values.join(',')}}`
}

function buildEvaluatorSource(cases, marker, evaluatorName) {
  const inputs = cases.map(({ values }) => javaArray(values)).join(',')
  const expected = cases.map(({ expected: value }) => value).join(',')
  return `final class ${evaluatorName} {
  public static void main(String[] args) {
    int[][] inputs = new int[][]{${inputs}};
    int[] expected = new int[]{${expected}};
    StringBuilder result = new StringBuilder("${marker}");
    for (int i = 0; i < inputs.length; i++) {
      try {
        int actual = new Solution().sum(inputs[i]);
        result.append(actual == expected[i] ? '1' : '0');
      } catch (Throwable error) {
        System.exit(23);
        return;
      }
    }
    System.out.println(result);
  }
}
`
}

function safeCompileDiagnostic(output) {
  const line = output.match(/(?:Solution\.java|DsaEvaluator_[a-f0-9]+\.java):(\d+):\s*error:/)?.[1]
  const code = /cannot find symbol/i.test(output)
    ? 'CANNOT_FIND_SYMBOL'
    : /incompatible types/i.test(output)
      ? 'INCOMPATIBLE_TYPES'
      : /missing return statement/i.test(output)
        ? 'MISSING_RETURN'
        : 'SYNTAX_ERROR'
  return [{ code, line: line ? Number(line) : null }]
}

function availableTime(deadline) {
  return Math.max(1, deadline - Date.now())
}

export async function evaluateJavaRequest(request, {
  dockerCommand = runDockerCommand,
  tempDirectory = os.tmpdir(),
  nonceFactory = () => randomBytes(12).toString('hex'),
} = {}) {
  const { source, cases, wallTimeMs } = validatedCases(request)
  const deadline = Date.now() + Math.min(
    Number.isInteger(wallTimeMs) && wallTimeMs > 0 ? wallTimeMs : MAX_WALL_TIME_MS,
    MAX_WALL_TIME_MS
  )
  const directory = await mkdtemp(path.join(tempDirectory, 'dsa-java-'))
  const marker = `__DSA_RESULT_${nonceFactory()}__`
  const evaluatorName = `DsaEvaluator_${nonceFactory()}`
  const evaluatorPath = `${evaluatorName}.java`
  let containerId = ''

  try {
    await Promise.all([
      writeFile(path.join(directory, 'Solution.java'), source, { encoding: 'utf8', flag: 'wx' }),
      writeFile(path.join(directory, evaluatorPath), buildEvaluatorSource(cases, marker, evaluatorName), { encoding: 'utf8', flag: 'wx' }),
    ])

    const create = await dockerCommand([
      'create',
      '--name', `dsa-java-${nonceFactory()}`,
      '--network', 'none',
      '--read-only',
      '--tmpfs', '/tmp:rw,noexec,nosuid,nodev,size=64m',
      '--mount', `type=bind,source=${directory},target=/input,readonly`,
      '--memory', `${MAX_MEMORY_MB}m`,
      '--memory-swap', `${MAX_MEMORY_MB}m`,
      '--cpus', '0.5',
      '--pids-limit', '64',
      '--cap-drop', 'ALL',
      '--security-opt', 'no-new-privileges',
      '--user', '10001:10001',
      '--workdir', '/tmp',
      '--env', 'HOME=/tmp',
      '--env', 'TMPDIR=/tmp',
      '--entrypoint', '/bin/sh',
      JAVA_IMAGE,
      '-c', 'while :; do sleep 3600; done',
    ], { timeoutMs: Math.min(5000, availableTime(deadline)), maxOutputBytes: 4096 })

    if (create.exitCode !== 0 || create.failedToStart || create.timedOut) {
      throw new WorkerUnavailableError('CONTAINER_CREATE_FAILED')
    }
    containerId = create.stdout.trim()
    if (!/^[a-f0-9]{12,64}$/i.test(containerId)) {
      throw new WorkerUnavailableError('CONTAINER_CREATE_FAILED')
    }

    const start = await dockerCommand(['start', containerId], {
      timeoutMs: Math.min(5000, availableTime(deadline)),
      maxOutputBytes: 4096,
    })
    if (start.exitCode !== 0 || start.failedToStart || start.timedOut) {
      throw new WorkerUnavailableError('CONTAINER_START_FAILED')
    }

    const compile = await dockerCommand([
      'exec', containerId, 'javac', '-proc:none', '-d', '/tmp',
      '/input/Solution.java', `/input/${evaluatorPath}`,
    ], { timeoutMs: availableTime(deadline), maxOutputBytes: MAX_OUTPUT_BYTES })
    if (compile.timedOut) return { status: 'timeout' }
    if (compile.outputLimit) {
      return { status: 'compile_error', diagnostics: [{ code: 'SYNTAX_ERROR', line: null }] }
    }
    if (compile.failedToStart || compile.exitCode === null) {
      throw new WorkerUnavailableError('COMPILER_START_FAILED')
    }
    if (compile.exitCode !== 0) {
      return { status: 'compile_error', diagnostics: safeCompileDiagnostic(`${compile.stdout}\n${compile.stderr}`) }
    }

    const execution = await dockerCommand([
      'exec', containerId, 'java', '-Xms16m', '-Xmx96m', '-XX:ActiveProcessorCount=1',
      '-cp', '/tmp', evaluatorName,
    ], { timeoutMs: availableTime(deadline), maxOutputBytes: MAX_OUTPUT_BYTES })
    if (execution.timedOut) return { status: 'timeout' }
    if (execution.outputLimit || execution.failedToStart || execution.exitCode !== 0) {
      return { status: 'runtime_error' }
    }

    const output = execution.stdout.split(/\r?\n/).find((line) => line.startsWith(marker))
    const resultString = output?.slice(marker.length)
    if (!resultString || !new RegExp(`^[01]{${cases.length}}$`).test(resultString)) {
      return { status: 'runtime_error' }
    }

    return {
      status: 'completed',
      results: [...resultString].map((passed) => ({ passed: passed === '1' })),
    }
  } finally {
    if (containerId) {
      await dockerCommand(['rm', '--force', containerId], { timeoutMs: 3000, maxOutputBytes: 4096 })
    }
    await rm(directory, { recursive: true, force: true })
  }
}

function authorized(request, token) {
  const supplied = request.get('authorization') || ''
  const expected = `Bearer ${token}`
  const suppliedBuffer = Buffer.from(supplied)
  const expectedBuffer = Buffer.from(expected)
  return suppliedBuffer.length === expectedBuffer.length && timingSafeEqual(suppliedBuffer, expectedBuffer)
}

export function createJavaWorkerApp({
  token,
  dockerCommand = runDockerCommand,
  evaluate = evaluateJavaRequest,
} = {}) {
  if (typeof token !== 'string' || token.length < 32) {
    throw new Error('JAVA_SANDBOX_TOKEN must contain at least 32 characters to start the Java worker.')
  }

  const app = express()
  app.use(express.json({ limit: '32kb' }))
  app.use((request, response, next) => {
    if (!authorized(request, token)) {
      return response.status(401).json({ success: false, error: 'Worker authentication failed.' })
    }
    next()
  })

  app.get('/health', async (_request, response) => {
    const result = await dockerCommand(['info', '--format', '{{.ServerVersion}}'], {
      timeoutMs: 1500,
      maxOutputBytes: 1024,
    })
    const available = result.exitCode === 0 && !result.failedToStart && !result.timedOut
    return response.status(available ? 200 : 503).json({
      available,
      reason: available ? null : 'docker_daemon_unavailable',
    })
  })

  app.post('/evaluate', async (request, response) => {
    try {
      const result = await evaluate(request.body)
      return response.json(result)
    } catch (error) {
      if (error instanceof WorkerInputError) {
        return response.status(400).json({ success: false, error: error.message })
      }
      return response.status(503).json({
        success: false,
        error: 'Java execution is unavailable. Start Docker Desktop and verify that its daemon is running.',
      })
    }
  })

  app.use((error, _request, response, _next) => {
    if (error?.type === 'entity.too.large') {
      return response.status(413).json({ success: false, error: 'Evaluation request exceeds the 32 KB limit.' })
    }
    return response.status(400).json({ success: false, error: 'Evaluation request must be valid JSON.' })
  })

  return app
}
