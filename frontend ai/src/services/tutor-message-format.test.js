import assert from 'node:assert/strict'
import test from 'node:test'
import { parseTutorMessage } from './tutor-message-format.js'

test('tutor message parser preserves paragraphs, breaks, and simple inline formatting', () => {
  assert.deepEqual(parseTutorMessage('Answer first.\nA new line with `left` and **bold**.'), [
    { type: 'paragraph', lines: [
      [{ type: 'text', text: 'Answer first.' }],
      [
        { type: 'text', text: 'A new line with ' },
        { type: 'inline-code', text: 'left' },
        { type: 'text', text: ' and ' },
        { type: 'bold', text: 'bold' },
        { type: 'text', text: '.' },
      ],
    ] },
  ])
})

test('tutor message parser groups ordered and unordered lists', () => {
  assert.deepEqual(parseTutorMessage('- First\n- Second\n\n1. One\n2. Two').map(({ type, items }) => ({
    type,
    items: items?.map((parts) => parts.map(({ text }) => text).join('')),
  })), [
    { type: 'unordered-list', items: ['First', 'Second'] },
    { type: 'ordered-list', items: ['One', 'Two'] },
  ])
})

test('tutor message parser preserves fenced code as text without interpreting HTML', () => {
  assert.deepEqual(parseTutorMessage('```java\nSystem.out.println("<b>safe</b>");\n```'), [
    { type: 'code', text: 'System.out.println("<b>safe</b>");' },
  ])
})

test('tutor message parser retains the complete response across lists and code blocks', () => {
  const response = [
    'Arrays have three important properties:',
    '',
    '1. **Fixed size:** The length is set when created.',
    '2. **Same type:** Every value has the same type.',
    '3. **Indexed access:** Read an element using its index.',
    '',
    '```java',
    'int[] values = {2, 4, 6};',
    '```',
  ].join('\n')

  const blocks = parseTutorMessage(response)
  const list = blocks.find((block) => block.type === 'ordered-list')
  const code = blocks.find((block) => block.type === 'code')

  assert.equal(list.items.length, 3)
  assert.deepEqual(list.items.map((parts) => parts.map((part) => part.text).join('')), [
    'Fixed size: The length is set when created.',
    'Same type: Every value has the same type.',
    'Indexed access: Read an element using its index.',
  ])
  assert.equal(code.text, 'int[] values = {2, 4, 6};')
  const renderedText = blocks.map((block) => {
    if (block.type === 'paragraph') return block.lines.map((parts) => parts.map((part) => part.text).join('')).join('\n')
    if (block.type === 'ordered-list' || block.type === 'unordered-list') {
      return block.items.map((parts) => parts.map((part) => part.text).join('')).join('\n')
    }
    if (block.type === 'code') return block.text
    return block.parts.map((part) => part.text).join('')
  }).join('\n')
  assert.equal(renderedText, [
    'Arrays have three important properties:',
    'Fixed size: The length is set when created.',
    'Same type: Every value has the same type.',
    'Indexed access: Read an element using its index.',
    'int[] values = {2, 4, 6};',
  ].join('\n'))
})
