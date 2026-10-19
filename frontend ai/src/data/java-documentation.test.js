import assert from 'node:assert/strict'
import test from 'node:test'
import { javaDocumentation, javaDocumentationCategories } from './java-documentation.js'

test('Java documentation has unique topics covering every section', () => {
  const ids = javaDocumentation.map((topic) => topic.id)
  const categories = new Set(javaDocumentation.map((topic) => topic.category))

  assert.equal(new Set(ids).size, ids.length)
  assert.deepEqual([...categories], javaDocumentationCategories)
  assert.ok(javaDocumentation.length >= 30)
})

test('Java documentation topics include learner guidance and DSA complexity', () => {
  for (const topic of javaDocumentation) {
    assert.ok(topic.title)
    assert.ok(topic.keywords)
    assert.ok(topic.summary)
    assert.ok(topic.example)
    assert.ok(topic.output)
    assert.ok(topic.mistake)
    assert.ok(topic.useCase)
    if (topic.category === 'Java for DSA') assert.ok(topic.complexity, topic.title)
  }
})
