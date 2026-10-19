import express from 'express'
import { gradeTopicQuiz, getPublicCurriculum } from '../services/curriculum-service.js'

const router = express.Router()

router.use(express.json({ limit: '32kb' }))

router.get('/', (_request, response) => {
  return response.json({
    success: true,
    topics: getPublicCurriculum(),
  })
})

router.post('/progression', (request, response) => {
  return response.json({
    success: true,
    topics: getPublicCurriculum(request.body || {}, { includeLockedContent: false }),
  })
})

router.post('/quiz/submit', (request, response) => {
  const { topicId, quizId, answers, progress } = request.body || {}
  const topic = getPublicCurriculum(progress, { includeLockedContent: false }).find((candidate) => candidate.id === topicId)
  if (!topic) {
    return response.status(404).json({ success: false, error: 'Topic was not found.' })
  }
  if (!topic.progression.unlocked) {
    return response.status(409).json({ success: false, error: 'Complete this topic’s prerequisites before taking its quiz.' })
  }

  const passed = gradeTopicQuiz({ topicId, quizId, answers })
  if (passed === null) {
    return response.status(400).json({ success: false, error: 'Quiz answers are invalid.' })
  }

  return response.json({ success: true, passed })
})

export { router as curriculumRouter }