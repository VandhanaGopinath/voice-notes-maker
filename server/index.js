/**
 * server/index.js
 * Express proxy server — forwards requests to Deepgram API.
 * Needed because Deepgram blocks direct browser→API calls (CORS).
 */

require('dotenv').config();
const express  = require('express');
const fetch    = require('node-fetch');
const multer   = require('multer');
const cors     = require('cors');
const path     = require('path');

const app    = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT   = process.env.PORT || 3000;
const DG_KEY = process.env.DEEPGRAM_API_KEY;
const DG_URL = 'https://api.deepgram.com';

// ── Middleware ────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Serve frontend from /public
app.use(express.static(path.join(__dirname, '..', 'public')));

// ── Helper ────────────────────────────────────────────────────────
function requireKey(req, res, next) {
  if (!DG_KEY) {
    return res.status(500).json({
      error: 'DEEPGRAM_API_KEY not set in .env — see .env.example',
    });
  }
  next();
}

// ── Route: GET /api/balance ───────────────────────────────────────
// Fetches the first project's balance from Deepgram
app.get('/api/balance', requireKey, async (req, res) => {
  try {
    // Step 1 — list projects
    const projectsRes = await fetch(`${DG_URL}/v1/projects`, {
      headers: { Authorization: `Token ${DG_KEY}` },
    });

    if (!projectsRes.ok) {
      const text = await projectsRes.text();
      return res.status(projectsRes.status).json({ error: text });
    }

    const { projects } = await projectsRes.json();
    if (!projects?.length) {
      return res.status(404).json({ error: 'No projects found for this API key' });
    }

    const projectId = projects[0].project_id;

    // Step 2 — get balances
    const balRes = await fetch(`${DG_URL}/v1/projects/${projectId}/balances`, {
      headers: { Authorization: `Token ${DG_KEY}` },
    });

    if (!balRes.ok) {
      const text = await balRes.text();
      return res.status(balRes.status).json({ error: text });
    }

    const balData = await balRes.json();
    const amount  = balData.balances?.[0]?.amount ?? 0;

    res.json({ balance: amount, project_id: projectId });

  } catch (err) {
    console.error('[/api/balance]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Route: POST /api/transcribe ───────────────────────────────────
// Receives audio blob from browser, forwards to Deepgram /v1/listen
app.post('/api/transcribe', requireKey, upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file received' });
  }

  const mimeType = req.file.mimetype || 'audio/webm';

  try {
    const dgRes = await fetch(
      `${DG_URL}/v1/listen?model=nova-2&smart_format=true&punctuate=true`,
      {
        method:  'POST',
        headers: {
          Authorization:  `Token ${DG_KEY}`,
          'Content-Type': mimeType,
        },
        body: req.file.buffer,
      }
    );

    if (!dgRes.ok) {
      const text = await dgRes.text();
      return res.status(dgRes.status).json({ error: text });
    }

    const data       = await dgRes.json();
    const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? '';

    res.json({ transcript });

  } catch (err) {
    console.error('[/api/transcribe]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Catch-all: serve index.html ───────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🎙️  VoiceNotes server running at http://localhost:${PORT}`);
  if (!DG_KEY) {
    console.warn('⚠️  DEEPGRAM_API_KEY not set — copy .env.example to .env\n');
  } else {
    console.log('✅  Deepgram API key loaded\n');
  }
});
