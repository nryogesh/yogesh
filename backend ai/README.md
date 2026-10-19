# DSA Mentor Backend

This backend powers the AI tutor for the DSA learning platform. It is designed to work without a paid API key in development mode and can later switch to Claude or other providers via configuration.

## 1) Create the environment

Open PowerShell in VS Code and run:

```powershell
cd "c:\Users\nryog\OneDrive\Desktop\agent\backend ai"
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

This project is using a lightweight Node.js backend, so the usual setup is:

```powershell
cd "c:\Users\nryog\OneDrive\Desktop\agent\backend ai"
npm install
```

## 2) Configure environment

Copy the example file and edit values if needed:

```powershell
Copy-Item .env.example .env
```

Example values:

```env
PORT=3001
CLIENT_ORIGIN=http://127.0.0.1:5173
AI_PROVIDER=local
ANTHROPIC_API_KEY=
LOCAL_MODEL_URL=http://localhost:11434
LOCAL_MODEL_NAME=llama3.1:8b
```

Do not commit `.env`.

## 3) Start the backend

```powershell
npm run dev
```

The server runs on:

```text
http://127.0.0.1:3001
```

## 4) Test the health endpoint

```powershell
curl http://127.0.0.1:3001/api/health
```

Example response:

```json
{
  "status": "ok",
  "provider": "local",
  "available": false
}
```

## 5) Test the chat endpoint

```powershell
curl -X POST http://127.0.0.1:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain binary search",
    "topic": "Binary Search",
    "difficulty": "beginner",
    "language": "Java",
    "user_level": "beginner"
  }'
```

## 6) Local AI model setup

If you want to use a local Ollama server, start it and confirm the endpoint is available:

```text
http://localhost:11434
```

Then set:

```env
AI_PROVIDER=local
LOCAL_MODEL_URL=http://localhost:11434
LOCAL_MODEL_NAME=llama3.1:8b
```

If no local model is running, the backend gracefully returns a helpful message instead of crashing.

## 7) Add Claude later

When ready for Claude, set:

```env
AI_PROVIDER=claude
ANTHROPIC_API_KEY=your_key_here
```

The architecture supports multiple providers without changing the app routes.

## 8) Connect the frontend

The frontend already points to the backend on port 3001. Ensure the frontend and backend are both running together in development.

## 9) Important security rules

- Never put API keys in the frontend
- Never commit `.env`
- Keep provider credentials server-side only
- Do not print secrets in logs

## 10) Java submission evaluation

Java source is never executed by the Express API. A separately started worker runs each supported submission in a fresh, restricted Docker container. The worker listens only on loopback and reports unavailable while Docker Desktop's daemon is stopped.

### Local Docker Desktop setup (Windows)

1. Install and start Docker Desktop using Linux containers. In PowerShell, verify `docker info` returns server details.
2. Pull the supported JDK image once:

   ```powershell
   docker pull eclipse-temurin:21-jdk-jammy
   ```

3. Generate a random token in PowerShell:

   ```powershell
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

   Add the generated value as `JAVA_SANDBOX_TOKEN` in `backend ai\.env`. Keep it server-side and use the same value for both processes.
4. Set these `backend ai\.env` entries:

   ```env
   JAVA_SANDBOX_URL=http://127.0.0.1:3002
   JAVA_SANDBOX_TOKEN=<the generated token>
   JAVA_WORKER_PORT=3002
   ```

5. Start the worker in a separate terminal:

   ```powershell
   npm run worker --prefix "backend ai"
   ```

6. Start the existing frontend and API normally. The assignment starter endpoint checks the authenticated worker health endpoint before enabling evaluation.

The worker is deliberately not part of the root `npm run dev` command: frontend and API development can continue when Docker is stopped, and submission remains disabled until the separate worker is healthy. The worker requires Node.js, Docker Desktop with a running daemon, and the JDK image above. It requires a token at least 32 characters long and binds only to `127.0.0.1`.

The current worker supports only the existing `pf-assignment-1` fixture and its `Solution.sum(int[])` entrypoint. Other assignments remain unavailable until evaluation fixtures and a matching evaluator are authored.

Each submission gets a disposable container with the fixed JDK image, no network, a read-only root filesystem and source mount, a non-root user, all Linux capabilities dropped, no-new-privileges, a 256 MB memory ceiling, 0.5 CPU, a 64-process limit, bounded output, and an 8-second wall-time limit. Compiler diagnostics are reduced to safe codes and line numbers; runtime output and private test data are not returned to the browser. The container and temporary source directory are removed after each request.

For a trusted remote worker, keep HTTPS and bearer authentication. Plain HTTP is accepted only for loopback addresses. Do not point this setting at a generic code runner or an untrusted URL.

The backend sends `POST {JAVA_SANDBOX_URL}/evaluate` with Java source, the existing assignment ID, an entrypoint, private test cases, and requested limits. The public API returns aggregate sample counts and whether additional checks passed; it never returns private fixtures, expected outputs, reference solutions, or raw worker diagnostics. The worker returns either one boolean result per test case, a safe compile-error code and line, or a runtime-error/timeout status. Starter metadata marks evaluation unavailable unless fixtures and a healthy worker are both present. Assignment completion is recorded only after all fixture cases pass.
