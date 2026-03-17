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

- 🎙️ Record audio in-browser with start/stop controls\
  
<img width="732" height="889" alt="1" src="https://github.com/user-attachments/assets/f3db2adb-aecb-4970-9701-2fff6904540e" />

- 📝 Real-time transcript display after each recording

<img width="745" height="907" alt="3" src="https://github.com/user-attachments/assets/c976f57f-1395-4a71-9c49-b0a8ec61121e" />

- 💳 Live wallet balance from Deepgram account

<img width="794" height="896" alt="2" src="https://github.com/user-attachments/assets/4f2ab1a7-c1a9-477e-8e91-b7604a47a2ae" />


- 💾 Save, manage, and delete notes (persisted via `localStorage`)

  
<img width="748" height="434" alt="4" src="https://github.com/user-attachments/assets/7872495b-c34b-4c99-a143-498b2ae15b16" />



- 📤 Export all notes as `.txt`

<img width="1313" height="416" alt="5" src="https://github.com/user-attachments/assets/42f869cc-f89f-4c6a-b28d-b4b2e4ba370c" />


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
