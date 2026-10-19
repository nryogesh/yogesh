import 'dotenv/config'
import { createJavaWorkerApp } from './java-execution-worker.js'

const port = Number(process.env.JAVA_WORKER_PORT || 3002)
const app = createJavaWorkerApp({ token: process.env.JAVA_SANDBOX_TOKEN })

app.listen(port, '127.0.0.1', () => {
  console.log(`Isolated Java worker listening on http://127.0.0.1:${port}`)
})
