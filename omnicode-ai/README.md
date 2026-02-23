# OmniCode AI

A full-stack, multi-model AI coding assistant that supports GPT-4o, Claude 3.5 Sonnet, Gemini Pro, and local Ollama models. Built with Next.js 14, Express, and MongoDB.

---

## Features

- 🤖 **Multi-model support** — Switch between OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, Google Gemini Pro, and locally hosted Ollama models in one click
- ⚡ **Streaming responses** — Real-time token streaming via Server-Sent Events for instant feedback
- 🛠 **Five coding modes** — Generate, Debug, Explain, Optimize, and Convert code
- 📝 **Monaco Editor** — VS Code-grade in-browser code editor with syntax highlighting for 20+ languages
- 📂 **File upload** — Upload source files up to 5 MB and analyze them instantly
- 💬 **Chat history** — Persistent chat sessions stored in MongoDB
- 🔐 **Firebase auth** — Optional Firebase Authentication (dev mode works without it)
- 🐳 **Docker-ready** — One command to launch the full stack with Docker Compose

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS, Zustand |
| Editor | Monaco Editor (`@monaco-editor/react`) |
| Backend | Node.js, Express 4 |
| Database | MongoDB + Mongoose |
| AI Providers | OpenAI SDK, Anthropic SDK, Google Generative AI, Ollama (HTTP) |
| Auth | Firebase Admin SDK |
| Streaming | Server-Sent Events (SSE) |
| Infra | Docker, Docker Compose |

---

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **MongoDB** (local or Atlas URI)
- At least one AI API key (OpenAI, Anthropic, or Google), **or** a running [Ollama](https://ollama.ai) instance
- *(Optional)* Firebase project for authentication

---

## Local Development Setup

### 1. Clone & navigate

```bash
git clone <your-repo-url>
cd omnicode-ai
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env and fill in your API keys (see Environment Variables section)
npm install
npm run dev        # starts on http://localhost:5000
```

### 3. Frontend setup

```bash
cd ../frontend
cp .env.example .env.local
# Edit .env.local — at minimum set NEXT_PUBLIC_API_URL=http://localhost:5000
npm install
npm run dev        # starts on http://localhost:3000
```

Open **http://localhost:3000** in your browser.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default `5000`) |
| `NODE_ENV` | No | `development` or `production` |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `CORS_ORIGIN` | No | Allowed frontend origin (default `http://localhost:3000`) |
| `OPENAI_API_KEY` | Conditional | Required to use GPT-4o |
| `OPENAI_DEFAULT_MODEL` | No | Default OpenAI model (default `gpt-4o`) |
| `ANTHROPIC_API_KEY` | Conditional | Required to use Claude |
| `ANTHROPIC_DEFAULT_MODEL` | No | Default Anthropic model |
| `GEMINI_API_KEY` | Conditional | Required to use Gemini Pro |
| `GEMINI_DEFAULT_MODEL` | No | Default Gemini model (default `gemini-pro`) |
| `OLLAMA_BASE_URL` | No | Ollama base URL (default `http://localhost:11434`) |
| `OLLAMA_DEFAULT_MODEL` | No | Default Ollama model (default `llama3`) |
| `FIREBASE_PROJECT_ID` | No | Firebase project ID (omit to disable auth in dev) |
| `FIREBASE_PRIVATE_KEY` | Conditional | Firebase Admin private key |
| `FIREBASE_CLIENT_EMAIL` | Conditional | Firebase Admin client email |

> **Dev tip:** If `FIREBASE_PROJECT_ID` is not set, all API requests are allowed without authentication — perfect for local development.

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL (e.g., `http://localhost:5000`) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | No | Firebase Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | No | Firebase Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | No | Firebase project ID |

---

## API Endpoints Reference

### General

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | API info |
| `GET` | `/health` | Health check (MongoDB status, uptime) |

### Chat (`/api/chat`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/chat/message` | ✓ | Send a message — streams SSE response |
| `GET` | `/api/chat/history` | ✓ | Get current user's chat history |
| `GET` | `/api/chat/:id` | ✓ | Get a specific chat with messages |
| `DELETE` | `/api/chat/:id` | ✓ | Delete a chat |

**POST `/api/chat/message` body:**
```json
{
  "messages": [{ "role": "user", "content": "Write a binary search in Python" }],
  "model": "openai",
  "mode": "generate",
  "targetLanguage": "python",
  "chatId": "optional-existing-chat-id"
}
```

**SSE response format:**
```
data: {"type":"chunk","content":"def "}
data: {"type":"chunk","content":"binary_search"}
data: [DONE]
```

### Auth (`/api/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/verify` | ✓ Firebase | Verify token, create/update user |
| `GET` | `/api/auth/me` | ✓ | Get current user profile |

### Upload (`/api/upload`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/upload/file` | ✓ | Upload a code file (max 5 MB) |

---

## Model Configuration Guide

### OpenAI
1. Get an API key from https://platform.openai.com
2. Set `OPENAI_API_KEY` in `backend/.env`
3. Optionally set `OPENAI_DEFAULT_MODEL` (e.g., `gpt-4o`, `gpt-4-turbo`, `gpt-3.5-turbo`)

### Anthropic Claude
1. Get an API key from https://console.anthropic.com
2. Set `ANTHROPIC_API_KEY` in `backend/.env`
3. Optionally set `ANTHROPIC_DEFAULT_MODEL` (e.g., `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229`)

### Google Gemini
1. Get an API key from https://aistudio.google.com
2. Set `GEMINI_API_KEY` in `backend/.env`
3. Optionally set `GEMINI_DEFAULT_MODEL` (e.g., `gemini-pro`, `gemini-1.5-pro`)

### Ollama (Local)
1. Install Ollama: https://ollama.ai
2. Pull a model: `ollama pull llama3` or `ollama pull codellama`
3. Ensure Ollama is running: `ollama serve`
4. Set `OLLAMA_BASE_URL` if not using the default `http://localhost:11434`
5. Set `OLLAMA_DEFAULT_MODEL` to your pulled model name

---

## Docker Deployment

### Prerequisites
- Docker ≥ 24
- Docker Compose v2

### Steps

```bash
# Copy and fill in environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# Edit both files with your actual values

# Build and start all services
docker compose up --build -d

# Check logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop
docker compose down
```

Services:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **MongoDB**: localhost:27017

---

## Cloud Deployment

### Frontend → Vercel

1. Push your code to GitHub
2. Import the project at https://vercel.com/new
3. Set **Root Directory** to `omnicode-ai/frontend`
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL` → your Render backend URL
   - Firebase variables if using auth
5. Deploy

### Backend → Render

1. Create a new **Web Service** at https://render.com
2. Connect your GitHub repository
3. Set **Root Directory** to `omnicode-ai/backend`
4. **Build Command**: `npm install`
5. **Start Command**: `node src/server.js`
6. Add all environment variables from `backend/.env.example`
7. Deploy

### MongoDB → MongoDB Atlas

1. Create a free cluster at https://cloud.mongodb.com
2. Whitelist Render's outbound IPs (or allow `0.0.0.0/0` for simplicity)
3. Copy the connection string and set `MONGODB_URI` in Render

---

## Security Notes

- **API Keys**: Never commit `.env` files. Use `.env.example` as a template.
- **Rate Limiting**: Chat endpoint is limited to 30 req/min; upload to 10 req/min per user.
- **File Uploads**: Only text/code file extensions are accepted; files are read into memory and never persisted to disk.
- **Helmet**: All HTTP responses include security headers via `helmet`.
- **Input Validation**: All chat and upload inputs are validated with `express-validator`.
- **Firebase Auth**: In production, set all `FIREBASE_*` environment variables to enforce token-based authentication.
- **CORS**: Set `CORS_ORIGIN` to your exact frontend domain in production to prevent cross-origin abuse.
- **MongoDB**: Use a strong password and network access restrictions in Atlas. Never expose port 27017 publicly.

---

## Project Structure

```
omnicode-ai/
├── frontend/                    # Next.js 14 App Router
│   ├── app/                     # Layouts and pages
│   ├── components/              # UI components
│   └── store/                   # Zustand global state
├── backend/
│   └── src/
│       ├── routes/              # Express route handlers
│       ├── services/            # AI provider integrations
│       ├── models/              # Mongoose schemas
│       └── middleware/          # Auth, rate limiting, errors
├── docker-compose.yml
└── README.md
```

---

## License

MIT
