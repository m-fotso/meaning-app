# Text-to-Speech (TTS) Implementation

Adds text-to-speech to the book reader using Piper TTS. Users can tap "Listen" on any page to hear it read aloud, with audio cached in Firebase Storage so it doesn't need to be regenerated.

## What Changed This Commit

### TTS Feature (New)
- Added a Python Flask TTS server using **Piper TTS** (fast, local, neural voice)
- "Listen" button in the book reader action bar with play/stop toggle
- Speed selector (Normal / Slow / Fast) appears when audio is playing
- Audio plays immediately via browser `Audio` API, then caches to Firebase Storage in the background
- On repeat listens, audio is served from Firebase cache (no regeneration)

### PDF Parsing Fixes
- Downgraded `pdf-parse` from v2 to v1 (`pdf-parse@1.0.9`) — v2 requires Node >= 20.16 and crashes with `DOMMatrix is not defined` on Node 20.11
- Updated `server/index.js` to use v1's function API instead of v2's class API

### Fallback Page Splitting
The PDF text splitter looks for `-- X of Y --` markers to divide pages. Most PDFs (including Alice in Wonderland) don't have these markers, so the entire book was treated as a single page.

**Fallback behavior**: If no page markers are found and the text is longer than 3000 characters, it splits into ~2000-character pages at paragraph boundaries (`\n\n`). This is a temporary solution until actual chapter/page parsing is implemented.

### Firebase Integration
- Added Firebase Storage export (`getStorage`) to `firebaseConfig.ts`
- TTS audio files are uploaded to Storage at `tts/{userId}/{bookId}/page-{page}-{voice}.wav`
- TTS metadata saved to Firestore subcollection `users/{userId}/tts/{docId}`
- Audio plays first, then uploads in the background (non-blocking)
- Cache lookup and upload failures are caught silently — TTS still works even if Firebase is down

## Architecture

```
Expo App (web)  -->  Python Flask Server (localhost:5051)  -->  Piper TTS
                -->  Firebase Storage (cached audio files)
                -->  Firestore (audio metadata)
```

## New Files

### `server/tts_server.py`
Flask server on port 5051. Accepts `POST /tts` with `{ text, voice }` and returns WAV audio.

- Uses Piper TTS (`en_US-lessac-medium` voice model) — generates 30s of audio in ~0.6s
- Speed control via `voice` param: "Normal" (1.0x), "Slow" (1.4x), "Fast" (0.7x)
- CORS enabled for browser requests
- No text length limit — handles full pages in one call

### `server/requirements.txt`
Python dependencies: `flask`, `flask-cors`, `piper-tts`

### `services/ttsService.ts`
TypeScript service layer for TTS with Firebase caching:

- `generateTTS(text, voice)` — calls the Python server, returns audio Blob
- `uploadAudio(userId, bookId, page, voice, blob)` — uploads WAV to Firebase Storage
- `saveTTSMetadata(userId, bookId, page, voice, url)` — saves metadata to Firestore
- `getCachedAudio(userId, bookId, page, voice)` — checks Firestore for cached audio URL

## Modified Files

### `services/firebaseConfig.ts`
- Added `getStorage` import and `storage` export

### `app/book/[id].tsx`
- **Listen button** in action bar — shows "Listen" / "Loading..." / "Stop"
- **Speed selector** appears when audio is playing/loading; opens modal with Normal/Slow/Fast
- **Playback flow**: tap Listen → check Firebase cache → if cached, play from URL → if not, call TTS server → play immediately → upload to Firebase in background
- **Audio playback** uses browser native `window.Audio` API
- **Fallback page splitting**: splits long text without page markers into ~2000-char pages at paragraph boundaries

### `server/index.js`
- Changed from `pdf-parse` v2 class API (`new PDFParse()`) to v1 function API (`pdfParse(buffer)`)

### `package.json`
- Added `expo-av` dependency
- Added `"tts-server": "python3 server/tts_server.py"` script
- Downgraded `pdf-parse` to `^1.0.9`

## System Dependencies

- **Python 3** — for the TTS server
- **piper-tts** — `pip install piper-tts` (downloads ~60MB voice model on first run)
- **Node.js 20.11+** — for the PDF parse server

The Piper voice model is stored at `~/.local/share/piper/en_US-lessac-medium.onnx`. If not present, download it:
```bash
mkdir -p ~/.local/share/piper
curl -L -o ~/.local/share/piper/en_US-lessac-medium.onnx \
  "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/lessac/medium/en_US-lessac-medium.onnx"
curl -L -o ~/.local/share/piper/en_US-lessac-medium.onnx.json \
  "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json"
```

## How to Run

Three terminals needed:

```bash
# Terminal 1: PDF parse server (port 5050)
cd meaning && npm run server

# Terminal 2: TTS server (port 5051)
cd meaning && npm run tts-server

# Terminal 3: Expo app
cd meaning && npx expo start
```

## Firebase Setup Required

1. **Enable Firebase Storage** in the Firebase Console
2. **Storage security rules** (Firebase Console → Storage → Rules):
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /tts/{userId}/{allPaths=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```
3. **Firestore rules** — add these matches for TTS and notes:
   ```
   match /users/{userId}/tts/{docId} {
     allow read, write: if request.auth != null && request.auth.uid == userId;
   }
   match /users/{userId}/notes/{noteId} {
     allow read, write: if request.auth != null && request.auth.uid == userId;
   }
   ```
4. **Firestore composite index** on `users/{userId}/tts` for fields: `bookId` (Asc), `page` (Asc), `voice` (Asc). Firestore will prompt you to create this the first time the cache query runs.

## Known Limitations

- **Page splitting is a fallback** — PDFs without `-- X of Y --` markers get split at ~2000-char paragraph boundaries. This doesn't respect actual book chapters or page breaks. Proper chapter/page detection needs to be implemented.
- **Single voice** — Piper's `lessac-medium` model has one voice. Speed (Normal/Slow/Fast) is the only variation. More voice models can be downloaded from the [Piper voices repo](https://huggingface.co/rhasspy/piper-voices).
- **Web only** — audio playback uses `window.Audio`. For native iOS/Android, `expo-av` is installed but not wired up yet.
- **notesService.ts is not connected** — the service exists with full CRUD but annotations in the book reader are still local state only (lost on refresh). Wiring it up is a separate task.
