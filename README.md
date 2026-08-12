<div align="center">

# Listenly

**AI-powered English listening practice from any YouTube video.**

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[**Live Demo**](https://listenly.example.com) &nbsp;·&nbsp; [**Report a Bug**](https://github.com/your-org/listenly/issues) &nbsp;·&nbsp; [**Request Feature**](https://github.com/your-org/listenly/issues)

</div>

---

## 📖 Overview

Listenly is a full-stack SaaS application that transforms any YouTube video into an interactive **dictation-based listening exercise**. Powered by Google Gemini AI, it automatically extracts transcripts, segments them into digestible listening chunks, and delivers a clean practice interface where learners type what they hear — receiving instant AI-graded feedback.

> **Built for language learners who want to train their listening comprehension using real-world, native content.**

<!-- 📸 SCREENSHOT PLACEHOLDER: Main hero / home page UI -->
<!-- Replace with: ![Home Page](docs/images/screenshot-home.png) -->

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎬 **Any YouTube Video** | Paste any YouTube URL — watch links, `youtu.be` short links, and Shorts supported |
| 🤖 **AI Segmentation** | Gemini AI intelligently splits the transcript into meaningful listening chunks |
| 🎧 **Synchronized Playback** | Video auto-seeks and auto-pauses at each segment boundary |
| ✍️ **Dictation Practice** | Type what you hear, get instant scoring with diff comparison |
| 💡 **Progressive Hints** | 3-level hint system: blank count → first letters → full answer |
| ⌨️ **Keyboard-First UX** | Full keyboard navigation — no mouse required during practice |
| 🔄 **Auto-Retry** | Failed lessons are automatically cleaned up and reprocessed |
| 📊 **Progress Tracking** | Visual progress bar per session |

---

## 🖥️ Screenshots

<table>
  <tr>
    <td align="center">
      <strong>Home — Paste URL</strong><br/>
      <!-- 📸 Replace with: <img src="docs/images/screenshot-home.png" width="400"/> -->
      <em>[ screenshot-home.png ]</em>
    </td>
    <td align="center">
      <strong>Practice Session</strong><br/>
      <!-- 📸 Replace with: <img src="docs/images/screenshot-practice.png" width="400"/> -->
      <em>[ screenshot-practice.png ]</em>
    </td>
  </tr>
  <tr>
    <td align="center">
      <strong>Answer Result &amp; Scoring</strong><br/>
      <!-- 📸 Replace with: <img src="docs/images/screenshot-result.png" width="400"/> -->
      <em>[ screenshot-result.png ]</em>
    </td>
    <td align="center">
      <strong>Hint System</strong><br/>
      <!-- 📸 Replace with: <img src="docs/images/screenshot-hint.png" width="400"/> -->
      <em>[ screenshot-hint.png ]</em>
    </td>
  </tr>
</table>

---

## 🏗️ Architecture

```
listenly/
├── backend/                        # FastAPI application
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py           # Pydantic settings (env-based)
│   │   │   └── database.py         # MongoDB async connection
│   │   ├── modules/
│   │   │   ├── content/            # Video ingestion & lesson API
│   │   │   │   ├── router.py
│   │   │   │   ├── services.py     # Transcript fetch + Gemini AI
│   │   │   │   └── schemas.py
│   │   │   └── practice/           # Practice session & scoring
│   │   └── workers/
│   │       └── llm_worker.py       # Async background processing
│   └── .env
│
└── frontend/                       # React + Vite SPA
    └── src/
        ├── pages/
        │   ├── Home.jsx            # URL submission & polling
        │   └── PracticeSession.jsx # Core practice UI
        ├── services/
        │   └── api.js              # Axios API client
        └── store/
            └── lessonStore.js      # Zustand global state
```

### Data Flow

```
User submits YouTube URL
        │
        ▼
[FastAPI] Extract video ID → check DB cache
        │
        ▼
[MongoDB] Create Lesson (status: "processing")
        │
        ▼
[Background Worker ─ async]
  ├── youtube-transcript-api  →  fetch English captions
  └── Google Gemini AI        →  segment into timed chunks
        │
        ▼
[MongoDB] Save Segments → Update Lesson (status: "ready")
        │
        ▼
[Frontend polling] Detect "ready" → navigate to Practice
        │
        ▼
[YouTube IFrame API] Sync playback ↔ segment timestamps
```

---

## 🛠️ Tech Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **FastAPI** | 0.100+ | REST API framework |
| **Motor** | 3.x | Async MongoDB driver |
| **MongoDB** | 7.0+ | Primary datastore |
| **google-genai** | 2.x | Gemini AI SDK |
| **youtube-transcript-api** | 1.2+ | Transcript extraction |
| **Uvicorn** | Latest | ASGI server |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19 | UI framework |
| **Vite** | 8.x | Build tool & dev server |
| **Zustand** | 5.x | Global state management |
| **Axios** | 1.x | HTTP client |
| **Lucide React** | Latest | Icon library |
| **YouTube IFrame API** | — | Embedded video control |

---

## 🚀 Getting Started

### Prerequisites

- **Python** 3.11+
- **Node.js** 18+
- **MongoDB** 7.0+ running locally or on [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Google Gemini API Key** — [Get one free](https://aistudio.google.com/app/apikey)

### 1. Clone the repository

```bash
git clone https://github.com/your-org/listenly.git
cd listenly
```

### 2. Backend setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
.\venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create your environment file:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=listenly
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

Start the API server:

```bash
# Windows (always run uvicorn from the venv)
.\venv\Scripts\uvicorn app.main:app --reload

# macOS / Linux
uvicorn app.main:app --reload

# API running at http://localhost:8000
# Interactive docs at http://localhost:8000/docs
```

### 3. Frontend setup

```bash
cd ../frontend

npm install
npm run dev

# App running at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) — paste any YouTube URL and start practicing!

---

## ⌨️ Keyboard Shortcuts

Listenly is designed for a **mouse-free** practice flow.

| Key | Action | Works while typing? |
|---|---|---|
| `Enter` | Check answer | ✅ Yes |
| `Enter` *(on result screen)* | Continue to next segment | ✅ Yes |
| `Escape` | Replay current segment | ✅ Yes |
| `Ctrl + ↑` | Replay current segment | ✅ Yes |
| `Ctrl + ←` | Go to previous segment | ✅ Yes |
| `Ctrl + →` | Go to next segment | ✅ Yes |
| `Shift + Enter` | Insert new line in textarea | ✅ Yes |

---

## 🔌 API Reference

**Base URL:** `http://localhost:8000`

Interactive Swagger docs: [`http://localhost:8000/docs`](http://localhost:8000/docs)

---

### `POST /api/videos/analyze`

Submit a YouTube URL for AI processing.

**Request body**
```json
{
  "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Response `200 OK`**
```json
{
  "lesson_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "processing"
}
```

---

### `GET /api/lessons/{lesson_id}`

Poll processing status and retrieve lesson data.

**Response `200 OK`** *(when ready)*
```json
{
  "status": "ready",
  "total_segments": 24,
  "youtube_id": "dQw4w9WgXcQ",
  "segments": [
    {
      "index": 1,
      "start": 12.1,
      "end": 18.5,
      "text": "Never gonna give you up, never gonna let you down",
      "difficulty": "B1"
    }
  ]
}
```

**Lesson status lifecycle:**

| Status | Meaning |
|---|---|
| `processing` | Background worker is fetching transcript and running AI segmentation |
| `ready` | Lesson is complete and segments are available |
| `failed` | No captions found, video is unavailable, or AI error — will auto-retry on next request |

---

## 🗄️ Database Schema

### Collection: `videos`

```json
{
  "_id": "uuid-v4",
  "youtube_id": "dQw4w9WgXcQ",
  "title": "Rick Astley - Never Gonna Give You Up",
  "thumbnail": "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  "created_at": "2026-08-12T00:00:00.000Z"
}
```

### Collection: `lessons`

```json
{
  "_id": "uuid-v4",
  "video_id": "uuid-v4",
  "status": "ready",
  "level": "B1",
  "total_segments": 24,
  "created_at": "2026-08-12T00:00:00.000Z"
}
```

### Collection: `segments`

```json
{
  "_id": "uuid-v4",
  "lesson_id": "uuid-v4",
  "sequence": 1,
  "start_time": 12.1,
  "end_time": 18.5,
  "text": "Never gonna give you up",
  "difficulty": "B1"
}
```

---

## ⚙️ Configuration Reference

All configuration is managed via environment variables in `.env`:

| Variable | Default | Required | Description |
|---|---|---|---|
| `MONGO_URI` | `mongodb://localhost:27017` | No | MongoDB connection string |
| `MONGO_DB_NAME` | `listenly` | No | Target database name |
| `GEMINI_API_KEY` | — | **Yes** | Google Gemini API key |
| `GEMINI_MODEL` | `gemini-1.5-flash` | No | Gemini model identifier |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes following the convention below
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

| Prefix | Description |
|---|---|
| `feat:` | A new feature |
| `fix:` | A bug fix |
| `docs:` | Documentation changes only |
| `style:` | Formatting, no logic change |
| `refactor:` | Code refactoring without feature changes |
| `test:` | Adding or updating tests |
| `chore:` | Maintenance tasks (deps, configs) |

**Example:**
```
feat: add spaced repetition review mode
fix: prevent double-firing on Enter keypress
docs: add keyboard shortcuts to README
```

---

## 🗺️ Roadmap

- [ ] User authentication & personal progress dashboard
- [ ] Multi-language support (Spanish, French, Japanese, Korean...)
- [ ] Spaced repetition review system
- [ ] Vocabulary extraction & flashcard generation
- [ ] Mobile-responsive PWA
- [ ] Export session history as CSV / PDF
- [ ] Public lesson library — share lessons by URL
- [ ] Browser extension for one-click practice from YouTube

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

## 🙏 Acknowledgements

- [Google Gemini](https://ai.google.dev) — AI segmentation engine
- [youtube-transcript-api](https://github.com/jdepoix/youtube-transcript-api) — Transcript extraction library
- [FastAPI](https://fastapi.tiangolo.com) — High-performance Python API framework
- [React](https://react.dev) — UI library
- [Zustand](https://zustand-demo.pmnd.rs) — Lightweight state management

---

<div align="center">

Made with ❤️ by NguyenThanhThiet87(https://github.com/NguyenThanhThiet87)

⭐ **Star this repo** if Listenly helped your English!

</div>
