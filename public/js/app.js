/**
 * public/js/app.js
 *
 * All Deepgram calls go through the local Express proxy (/api/*)
 * so there are no CORS errors.
 */

'use strict';

// ── State ─────────────────────────────────────────────────────────
let mediaRecorder     = null;
let audioChunks       = [];
let isRecording       = false;
let timerInterval     = null;
let timerSeconds      = 0;
let currentTranscript = '';
let notes             = JSON.parse(localStorage.getItem('voiceNotes') || '[]');

// ── DOM helpers ───────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);

function setStatus(msg, type = '') {
  $('statusDot').className = 'status-dot' + (type ? ' ' + type : '');
  $('statusText').textContent = msg;
}

function showToast(msg, type = 'success', icon = '✓') {
  $('toastMsg').textContent  = msg;
  $('toastIcon').textContent = icon;
  const t = $('toast');
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3200);
}

function updateTimer() {
  timerSeconds++;
  const m = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
  const s = String(timerSeconds % 60).padStart(2, '0');
  $('timer').textContent = `${m}:${s}`;
}

function setTranscript(text) {
  currentTranscript = text;
  const display = $('transcriptDisplay');

  if (text.trim()) {
    display.textContent = text;
    display.classList.add('has-content');
    $('saveBtn').disabled = false;
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    $('wordCount').textContent = `${words} word${words !== 1 ? 's' : ''}`;
  } else {
    display.innerHTML = '<span class="transcript-placeholder">✦ Your transcription will appear here after recording...</span>';
    display.classList.remove('has-content');
    $('saveBtn').disabled = true;
    $('wordCount').textContent = '';
  }
}

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Balance ───────────────────────────────────────────────────────
async function fetchBalance() {
  const display = $('balanceDisplay');
  display.textContent = '...';
  display.className   = 'balance-amount loading';

  try {
    const res  = await fetch('/api/balance');
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

    display.textContent = `$${Number(data.balance).toFixed(4)}`;
    display.className   = 'balance-amount';

  } catch (err) {
    display.textContent = 'N/A';
    display.className   = 'balance-amount';
    showToast('Balance: ' + err.message, 'error', '✕');
  }
}

// ── Recording ─────────────────────────────────────────────────────
async function toggleRecording() {
  if (!isRecording) {
    await startRecording();
  } else {
    stopRecording();
  }
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks  = [];

    const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
    mediaRecorder  = new MediaRecorder(stream, mimeType ? { mimeType } : {});

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      await transcribeAudio();
    };

    mediaRecorder.start(100);
    isRecording   = true;
    timerSeconds  = 0;
    timerInterval = setInterval(updateTimer, 1000);

    $('recordBtn').classList.add('recording');
    $('recordIcon').textContent = '⏹';
    $('timer').classList.add('visible');
    $('waveform').classList.add('visible');
    setStatus('Recording… speak clearly into your mic', 'active');

  } catch (err) {
    showToast('Mic access denied — please allow microphone', 'error', '✕');
    setStatus('Microphone access denied', '');
  }
}

function stopRecording() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    isRecording = false;
    clearInterval(timerInterval);

    $('recordBtn').classList.remove('recording');
    $('recordIcon').textContent = '🎙️';
    $('waveform').classList.remove('visible');
    setStatus('Processing audio…', 'processing');
  }
}

// ── Transcription ─────────────────────────────────────────────────
async function transcribeAudio() {
  const mimeType = audioChunks[0]?.type || 'audio/webm';
  const blob     = new Blob(audioChunks, { type: mimeType });

  // Send as FormData so multer on the server can parse it
  const formData = new FormData();
  formData.append('audio', blob, 'recording.webm');

  try {
    const res  = await fetch('/api/transcribe', { method: 'POST', body: formData });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

    $('timer').classList.remove('visible');

    if (data.transcript?.trim()) {
      const appended = currentTranscript
        ? currentTranscript + '\n\n' + data.transcript
        : data.transcript;
      setTranscript(appended);
      setStatus('Transcription complete ✓', 'success');
      showToast('Transcription ready!', 'success', '✓');
    } else {
      setStatus('No speech detected — try again', '');
      showToast('No speech detected', 'info', 'ℹ');
    }

    fetchBalance(); // refresh balance after each transcription

  } catch (err) {
    setStatus('Transcription failed: ' + err.message, '');
    showToast('Error: ' + err.message, 'error', '✕');
    $('timer').classList.remove('visible');
  }
}

// ── Notes ─────────────────────────────────────────────────────────
function saveNote() {
  if (!currentTranscript.trim()) return;

  const note = {
    id:   Date.now(),
    text: currentTranscript.trim(),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
  };

  notes.unshift(note);
  localStorage.setItem('voiceNotes', JSON.stringify(notes));
  renderNotes();
  showToast('Note saved!', 'success', '✓');
}

function deleteNote(id) {
  notes = notes.filter((n) => n.id !== id);
  localStorage.setItem('voiceNotes', JSON.stringify(notes));
  renderNotes();
  showToast('Note deleted', 'info', '✕');
}

function clearAllNotes() {
  if (!notes.length) return;
  notes = [];
  localStorage.setItem('voiceNotes', JSON.stringify(notes));
  renderNotes();
  showToast('All notes cleared', 'info', '🗑');
}

function clearTranscript() {
  setTranscript('');
  $('timer').classList.remove('visible');
  timerSeconds = 0;
}

function exportNotes() {
  if (!notes.length) { showToast('No notes to export', 'info', 'ℹ'); return; }

  const content = notes.map((n) => `[${n.date} ${n.time}]\n${n.text}`).join('\n\n---\n\n');
  const blob    = new Blob([content], { type: 'text/plain' });
  const url     = URL.createObjectURL(blob);
  const a       = Object.assign(document.createElement('a'), {
    href: url, download: `voice-notes-${new Date().toISOString().slice(0,10)}.txt`
  });
  a.click();
  URL.revokeObjectURL(url);
  showToast('Notes exported!', 'success', '📄');
}

function renderNotes() {
  const list = $('notesList');
  if (!notes.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        No saved notes yet. Record and save your first voice note.
      </div>`;
    return;
  }
  list.innerHTML = notes.map((n) => `
    <div class="note-item">
      <div class="note-meta">
        <span class="note-time">${n.date} · ${n.time}</span>
        <button class="note-delete" onclick="deleteNote(${n.id})">✕</button>
      </div>
      <div>${escapeHTML(n.text)}</div>
    </div>`).join('');
}

// ── Init ──────────────────────────────────────────────────────────
renderNotes();
setStatus('Click the mic to start recording', '');
fetchBalance();
