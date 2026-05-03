# meaning
This will serve as a repository for the development of "Meaning", and app for ebook viewing and development

## Running the app

Install dependencies:

```bash
cd meaning
npm install
```

Start the Expo app (Terminal 1):

```bash
cd meaning
npm start
```

Start the PDF parsing API server (Terminal 2):

```bash
cd meaning
npm run server
```

Start the TTS server (Terminal 3):


The app calls a local Piper TTS server on port **5051**. 

```bash
cd meaning
pip install -r server/requirements.txt   # flask, flask-cors, piper-tts (first voice download may happen on first use)
npm run tts-server                       # http://localhost:5051
```

**TTS environment:** The Python server loads `meaning/server/.env` if present. To use Azure voices in the app, add `AZURE_SPEECH_KEY` and optionally `AZURE_SPEECH_REGION` (defaults to `eastus`).

Open the app:

- Web: open the URL shown in the Expo output.
- iOS/Android: Find local ip address and open app there
