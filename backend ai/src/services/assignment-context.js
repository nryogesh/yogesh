import { dsaTopics } from '../data/topics.js'

export function getPublicAssignmentContext(assignmentId) {
  if (typeof assignmentId !== 'string' || !assignmentId.trim()) return null

  for (const topic of dsaTopics) {
    if (topic.status !== 'published') continue
    const assignment = topic.assignments.find((candidate) => candidate.id === assignmentId.trim())
    if (!assignment) continue

    return {
      topic: topic.name,
      assignment: {
        id: assignment.id,
        title: assignment.title,
        difficulty: assignment.difficulty,
        language: assignment.language || 'Java',
        description: assignment.description,
        constraints: [...(assignment.constraints || [])],
        examples: (assignment.examples || []).map(({ input, output, explanation }) => ({ input, output, explanation })),
        learningObjectives: [...(assignment.learningObjectives || [])],
        hints: [...(assignment.hints || [])],
      },
    }
  }

  return null
}
