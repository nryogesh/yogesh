import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { config } from './src/config.js'
import { chatRouter } from './src/routes/chat.js'
import { curriculumRouter } from './src/routes/curriculum.js'
import { healthRouter } from './src/routes/health.js'
import { hintsRouter } from './src/routes/hints.js'
import { problemsRouter } from './src/routes/problems.js'
import { submissionsRouter } from './src/routes/submissions.js'

const app = express()
const localDevelopmentOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
]

app.use((request, _response, next) => {
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.path}`)
  next()
})

app.use(cors({
  origin: localDevelopmentOrigins,
  credentials: true,
}))
app.use(express.json({ limit: '32kb' }))

app.use('/api/health', healthRouter)
app.use('/api/curriculum', curriculumRouter)
app.use('/api/chat', chatRouter)
app.use('/api/hints', hintsRouter)
app.use('/api/problems', problemsRouter)
app.use('/api/submissions', submissionsRouter)

app.get('/', (_request, response) => {
  response.json({
    name: 'DSA Mentor Backend',
    status: 'ok',
    provider: config.aiProvider,
  })
})

app.use((error, _request, response, _next) => {
  if (error?.type === 'entity.too.large') {
    return response.status(413).json({
      success: false,
      error: 'Request body exceeds the 32 KB limit',
    })
  }

  console.error('Unhandled error:', error)
  response.status(500).json({
    success: false,
    error: 'Unexpected server error',
  })
})

app.listen(config.port, () => {
  console.log(`Mentor AI backend listening on http://127.0.0.1:${config.port}`)
  console.log(`Configured AI provider: ${config.aiProvider}`)
})
