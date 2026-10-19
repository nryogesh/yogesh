import assert from 'node:assert/strict'
import test from 'node:test'
import { ChatService } from '../src/services/chat-service.js'

test('chat service includes canonical assignment context and learner settings', async () => {
  let context
  const service = new ChatService({
    respond: async (value) => {
      context = value
      return { success: true, response: 'Let’s reason through the loop.', agent: 'dsa_tutor', topic: value.topic }
    },
  })

  const result = await service.handleChat({
    message: 'I am stuck.',
    assignment_id: 'pf-assignment-1',
    difficulty: 'advanced',
    language: 'Python',
    user_level: 'intermediate',
    conversation_history: [{ role: 'user', content: 'I tried a loop.' }],
  })

  assert.equal(result.success, true)
  assert.equal(context.topic, 'Programming Fundamentals')
  assert.equal(context.difficulty, 'beginner')
  assert.equal(context.language, 'Java')
  assert.equal(context.userLevel, 'intermediate')
  assert.equal(context.assignmentContext.title, 'Sum of values with a loop')
  assert.equal(context.assignmentContext.referenceSolution, undefined)
  assert.equal(context.assignmentContext.grading, undefined)
  assert.equal(context.conversationHistory[0].content, 'I tried a loop.')
})

test('chat service remains compatible with requests without an assignment ID', async () => {
  let context
  const service = new ChatService({
    respond: async (value) => {
      context = value
      return { success: true, response: 'Arrays store indexed values.', agent: 'dsa_tutor', topic: value.topic }
    },
  })

  const result = await service.handleChat({
    message: 'Explain arrays',
    topic: 'Arrays',
    difficulty: 'beginner',
    language: 'Java',
    user_level: 'beginner',
  })

  assert.equal(result.success, true)
  assert.equal(context.topic, 'Arrays')
  assert.equal(context.assignmentContext, null)
})

test('chat service preserves a labelled fallback response', async () => {
  const service = new ChatService({
    respond: async () => ({
      success: true,
      response: 'General guidance (AI unavailable): try a small example.',
      fallback: true,
      agent: 'dsa_tutor',
      topic: 'Arrays',
    }),
  })

  const result = await service.handleChat({ message: 'Help me with arrays.' })
  assert.equal(result.fallback, true)
  assert.match(result.response, /General guidance/)
})

test('chat service preserves the full assistant response including line breaks and code', async () => {
  const assistantResponse = 'Answer first.\n\n1. First point.\n2. Second point.\n\n```java\nint[] values = {1, 2};\n```'
  const service = new ChatService({
    respond: async () => ({
      success: true,
      response: assistantResponse,
      agent: 'dsa_tutor',
      topic: 'Arrays',
    }),
  })

  const result = await service.handleChat({ message: 'Explain arrays.' })
  assert.equal(result.response, assistantResponse)
})
