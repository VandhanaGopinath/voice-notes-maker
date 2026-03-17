# 🎙️ VoiceNotes — Deepgram Transcriber

A voice-to-text notes app using the **Deepgram Nova-2** model.  
Built with Node.js + Express (proxy server) + Vanilla JS frontend.

> **Why a server?** Deepgram blocks direct browser→API calls due to CORS.  
> This Express server acts as a secure proxy — your API key stays on the server, never exposed to the browser.

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/voice-notes-maker.git
cd voice-notes-maker
npm install
```

### 2. Set up your API key

```bash
cp .env.example .env
```

Open `.env` and add your Deepgram API key:

```
DEEPGRAM_API_KEY=your_actual_key_here
PORT=3000
```

Get your key free at [console.deepgram.com](https://console.deepgram.com)

### 3. Run the app

```bash
npm start
```

Then open **http://localhost:3000** in your browser.

For development with auto-reload:

```bash
npm run dev
```

---

## 📁 Project Structure

```
voice-notes-maker/
├── server/
│   └── index.js          # Express proxy server
├── public/
│   ├── index.html         # Frontend UI
│   ├── css/
│   │   └── style.css      # All styles & animations
│   └── js/
│       └── app.js         # Frontend logic (calls /api/*)
├── .env.example           # Template — copy to .env
├── .gitignore
├── package.json
└── README.md
```

---

## 🔌 How It Works

```
Browser → POST /api/transcribe → Express Server → Deepgram API
Browser → GET  /api/balance    → Express Server → Deepgram API
```

The server adds the `Authorization: Token` header using the key from `.env`.  
The browser never touches Deepgram directly, so there are no CORS errors.

---

## 🛠️ API Endpoints (Server)

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/balance` | Fetch wallet balance from Deepgram |
| `POST` | `/api/transcribe` | Send audio blob, get transcript back |

---

## ✨ Features

- 🎙️ Record audio in-browser with start/stop controls
- 📝 Real-time transcript display after each recording
- 💳 Live wallet balance from Deepgram account
- 💾 Save, manage, and delete notes (persisted via `localStorage`)
- 📤 Export all notes as `.txt`
- 📱 Responsive design, works on mobile

---

## ⚙️ Tech Stack

- **Backend:** Node.js, Express, node-fetch, multer
- **Frontend:** Vanilla HTML / CSS / JavaScript
- **API:** Deepgram Nova-2 (speech-to-text)
- **Fonts:** Syne + DM Mono

---

## 📋 Evaluation Checklist

- [x] Deepgram API initialized with authentication
- [x] Start/stop audio recording controls
- [x] Transcript displayed after recording
- [x] Wallet balance fetched and displayed
- [x] Plain text notes — no database
- [x] Error handling (mic denied, API errors, empty audio)
- [x] Clean code organization (server / public separated)
- [x] No CORS errors

---

## 📄 License

MIT
