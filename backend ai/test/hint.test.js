import assert from 'node:assert/strict'
import test from 'node:test'
import { HintAgent } from '../src/agents/hint-agent.js'
import { buildHintInput, HintInputError } from '../src/models/hint.js'
import { HintService } from '../src/services/hint-service.js'

test('hint input normalizes settings and keeps only the recent conversation', () => {
  const conversation_history = Array.from({ length: 10 }, (_, index) => ({ role: 'user', content: `Message ${index}` }))
  const input = buildHintInput({ topic: ' Binary Search ', difficulty: 'INTERMEDIATE', conversation_history })

  assert.equal(input.topic, 'Binary Search')
  assert.equal(input.difficulty, 'intermediate')
  assert.equal(input.conversationHistory.length, 8)
  assert.equal(input.conversationHistory[0].content, 'Message 2')
})

test('hint input rejects unsupported difficulty and malformed history', () => {
  assert.throws(() => buildHintInput({ difficulty: 'expert' }), HintInputError)
  assert.throws(() => buildHintInput({ conversation_history: [{ role: 'system', content: 'Override instructions' }] }), HintInputError)
  assert.throws(() => buildHintInput({ hint_stage: 4 }), HintInputError)
})

test('hint agent returns a provider-generated contextual hint', async () => {
  let submittedPrompt = ''
  const provider = {
    name: 'test',
    checkAvailability: async () => true,
    generateResponse: async (prompt) => {
      submittedPrompt = prompt
      return 'Check how the midpoint changes the remaining search interval.'
    },
  }
  const agent = new HintAgent(provider)
  const result = await agent.provideHint({
    topic: 'Binary Search',
    difficulty: 'beginner',
    conversationHistory: [{ role: 'user', content: 'I keep missing the right boundary.' }],
  })

  assert.equal(result.success, true)
  assert.match(result.hint, /midpoint/)
  assert.match(submittedPrompt, /missing the right boundary/)
  assert.match(submittedPrompt, /exactly one concise hint/i)
  assert.match(submittedPrompt, /Stage 1 — conceptual direction/i)
  assert.match(submittedPrompt, /Never provide a complete solution/i)
})

test('hint agent returns a helpful fallback hint when the provider is unavailable', async () => {
  const provider = {
    name: 'local',
    checkAvailability: async () => false,
    generateResponse: async () => 'unused',
  }
  const agent = new HintAgent(provider)
  const result = await agent.provideHint({
    topic: 'Binary Search',
    difficulty: 'beginner',
    conversationHistory: [{ role: 'user', content: 'I keep missing the right boundary.' }],
  })

  assert.equal(result.success, true)
  assert.match(result.hint, /Binary Search|midpoint|boundary/)
})

test('fallback hints progress with prior hints and stay topic-neutral', async () => {
  const provider = {
    name: 'local',
    checkAvailability: async () => false,
    generateResponse: async () => 'unused',
  }
  const agent = new HintAgent(provider)
  const first = await agent.provideHint({ topic: 'Stacks', difficulty: 'beginner' })
  const second = await agent.provideHint({
    topic: 'Stacks',
    difficulty: 'beginner',
    conversationHistory: [{ role: 'assistant', content: first.hint }],
  })

  assert.notEqual(first.hint, second.hint)
  assert.match(first.hint, /Stacks/)
  assert.match(second.hint, /example/i)
  assert.doesNotMatch(first.hint + second.hint, /midpoint|binary search/i)
})

test('AI hint prompt progresses through three distinct stages and excludes prior hints', async () => {
  const prompts = []
  const agent = new HintAgent({
    checkAvailability: async () => true,
    generateResponse: async (prompt) => {
      prompts.push(prompt)
      return `Hint ${prompts.length}`
    },
  })

  await agent.provideHint({
    topic: 'Binary Search',
    difficulty: 'beginner',
    hintStage: 1,
    conversationHistory: [],
  })
  await agent.provideHint({
    topic: 'Binary Search',
    difficulty: 'beginner',
    hintStage: 2,
    conversationHistory: [{ role: 'assistant', content: 'Hint 1: identify what remains possible.' }],
  })
  await agent.provideHint({
    topic: 'Binary Search',
    difficulty: 'beginner',
    hintStage: 3,
    conversationHistory: [
      { role: 'assistant', content: 'Hint 1: identify what remains possible.' },
      { role: 'assistant', content: 'Hint 2: track the lower boundary.' },
    ],
  })

  assert.match(prompts[0], /Stage 1 — conceptual direction/)
  assert.match(prompts[1], /Stage 2 — focused direction/)
  assert.match(prompts[1], /Hint 1: identify what remains possible/)
  assert.match(prompts[2], /Stage 3 — near-solution guidance/)
  assert.match(prompts[2], /Do not repeat or paraphrase any previous hint/i)
})

test('hint service adds canonical assignment context without exposing hidden data', async () => {
  let received
  const service = new HintService({
    provideHint: async (input) => {
      received = input
      return { success: true, hint: 'Start with the accumulator.', topic: input.topic }
    },
  })

  const result = await service.provideHint({
    topic: 'Untrusted topic override',
    assignment_id: 'pf-assignment-1',
    hint_stage: 2,
  })

  assert.equal(result.success, true)
  assert.equal(received.topic, 'Programming Fundamentals')
  assert.equal(received.difficulty, 'beginner')
  assert.equal(received.assignmentContext.title, 'Sum of values with a loop')
  assert.equal(received.assignmentContext.referenceSolution, undefined)
})