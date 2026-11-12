import assert from 'node:assert/strict'
import test from 'node:test'
import { createVisualizationSteps, parseIntegerArray } from './visualization-steps.js'

test('array input parsing requires a bounded list of whole numbers', () => {
  assert.deepEqual(parseIntegerArray('3, -1, 8'), [3, -1, 8])
  assert.throws(() => parseIntegerArray('1, , 2'), /comma-separated/)
  assert.throws(() => parseIntegerArray('1.5, 2'), /whole numbers/)
})

test('bubble sort frames show comparisons, swaps and the actual sorted result', () => {
  const frames = createVisualizationSteps('bubble-sort', [4, 1, 3], '')
  assert.deepEqual(frames.at(-1).array, [1, 3, 4])
  assert.ok(frames.some((frame) => frame.message.startsWith('Swap them')))
  assert.deepEqual(frames.at(-1).sortedIndices, [0, 1, 2])
})

test('insertion sort frames show the inserted value and sorted result', () => {
  const frames = createVisualizationSteps('insertion-sort', [3, 1, 2], '')
  assert.deepEqual(frames.at(-1).array, [1, 2, 3])
  assert.ok(frames.some((frame) => frame.message.includes('Insert 1')))
})

test('linear search stops at a match and reports a missing target honestly', () => {
  const found = createVisualizationSteps('linear-search', [2, 5, 8], 5)
  const missing = createVisualizationSteps('linear-search', [2, 5, 8], 6)
  assert.deepEqual(found.at(-1).resultIndices, [1])
  assert.match(missing.at(-1).message, /not found/)
})

test('binary search rejects unsorted input and traces the actual target index', () => {
  assert.throws(() => createVisualizationSteps('binary-search', [2, 1], 1), /sorted in ascending order/)
  const frames = createVisualizationSteps('binary-search', [1, 4, 7, 9], 7)
  assert.deepEqual(frames.at(-1).resultIndices, [2])
})
