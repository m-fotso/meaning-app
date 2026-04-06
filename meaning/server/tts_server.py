from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from dotenv import load_dotenv
import os
import re
import glob
import tempfile
import wave
import requests
from piper import PiperVoice
from piper.config import SynthesisConfig

# Load .env from the same directory as this script
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

app = Flask(__name__)
CORS(app)


# ── Text preprocessing ────────────────────────────────────────────
# PDF parsers insert hard line breaks mid-sentence. These cause
# unnatural pauses in TTS engines. Clean them up before synthesis.

def _clean_text_for_tts(text: str) -> str:
    """Normalize PDF-extracted text for natural TTS output."""
    # Preserve paragraph breaks (2+ newlines) by replacing with placeholder
    text = re.sub(r'\n\s*\n', '\n\n', text)
    paragraphs = text.split('\n\n')

    cleaned = []
    for para in paragraphs:
        # Replace single newlines (mid-sentence line breaks) with a space
        p = para.replace('\n', ' ')
        # Collapse multiple spaces into one
        p = re.sub(r' {2,}', ' ', p)
        # Fix broken hyphenation (e.g., "some-\n thing" → "something")
        p = re.sub(r'(\w)- (\w)', r'\1\2', p)
        cleaned.append(p.strip())

    # Rejoin paragraphs with a period-pause-friendly separator
    return '\n\n'.join(p for p in cleaned if p)


# ── Piper TTS (free) ──────────────────────────────────────────────

MODEL_DIR = os.path.expanduser("~/.local/share/piper")

# Cache of loaded Piper voice models: model_name -> PiperVoice
_piper_cache: dict[str, PiperVoice] = {}


def _scan_piper_voices() -> dict[str, str]:
    """Scan MODEL_DIR for available .onnx voice models.
    Returns {model_name: friendly_name}."""
    voices = {}
    for onnx_path in glob.glob(os.path.join(MODEL_DIR, "*.onnx")):
        fname = os.path.basename(onnx_path)
        model_name = fname.replace(".onnx", "")
        # Convert "en_US-lessac-medium" to "Lessac Medium (en_US)"
        parts = model_name.split("-", 1)
        if len(parts) == 2:
            locale = parts[0]
            name_parts = parts[1].replace("-", " ").title()
            friendly = f"{name_parts} ({locale})"
        else:
            friendly = model_name
        voices[model_name] = friendly
    return voices


def _get_piper_voice(model_name: str) -> PiperVoice:
    """Load a Piper voice model by name, using cache."""
    if model_name in _piper_cache:
        return _piper_cache[model_name]

    model_path = os.path.join(MODEL_DIR, f"{model_name}.onnx")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Piper model not found: {model_path}")

    v = PiperVoice.load(model_path)
    _piper_cache[model_name] = v
    return v


# Pre-load default voice
DEFAULT_PIPER_VOICE = "en_US-lessac-medium"
try:
    _get_piper_voice(DEFAULT_PIPER_VOICE)
except FileNotFoundError:
    print(f"Warning: default Piper model '{DEFAULT_PIPER_VOICE}' not found in {MODEL_DIR}")


SPEED_MAP = {
    "Normal": 1.0,
    "Slow": 1.4,
    "Fast": 0.7,
}


@app.route("/voices", methods=["GET"])
def list_voices():
    """Return available voices for each engine."""
    piper_voices = _scan_piper_voices()
    azure_voices = {
        "en-US-AvaMultilingualNeural": "Ava (Female, HD)",
        "en-US-AndrewMultilingualNeural": "Andrew (Male, HD)",
        "en-US-EmmaMultilingualNeural": "Emma (Female, HD)",
        "en-US-BrianMultilingualNeural": "Brian (Male, HD)",
        "en-US-JennyMultilingualNeural": "Jenny (Female)",
        "en-US-AriaNeural": "Aria (Female)",
        "en-US-GuyNeural": "Guy (Male)",
        "en-US-DavisNeural": "Davis (Male)",
    }
    return jsonify({
        "piper": piper_voices,
        "azure": azure_voices,
    })


@app.route("/tts", methods=["POST"])
def generate_tts():
    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' field"}), 400

    text = _clean_text_for_tts(data["text"])
    speed_name = data.get("voice", "Normal")
    model_name = data.get("piperVoice", DEFAULT_PIPER_VOICE)
    length_scale = SPEED_MAP.get(speed_name, 1.0)

    syn_config = SynthesisConfig(length_scale=length_scale)

    try:
        piper_voice = _get_piper_voice(model_name)
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 400

    tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    tmp_path = tmp.name
    tmp.close()

    try:
        with wave.open(tmp_path, "wb") as wav:
            piper_voice.synthesize_wav(text, wav, syn_config=syn_config)

        with open(tmp_path, "rb") as f:
            audio_data = f.read()

        return Response(audio_data, mimetype="audio/wav")
    finally:
        os.unlink(tmp_path)


# ── Azure TTS (premium) ───────────────────────────────────────────

AZURE_SPEECH_KEY = os.environ.get("AZURE_SPEECH_KEY", "")
AZURE_SPEECH_REGION = os.environ.get("AZURE_SPEECH_REGION", "eastus")

AZURE_SPEED_MAP = {
    "Normal": "0%",
    "Slow": "-30%",
    "Fast": "+40%",
}

DEFAULT_AZURE_VOICE = "en-US-AvaMultilingualNeural"


@app.route("/tts/azure", methods=["POST"])
def generate_tts_azure():
    if not AZURE_SPEECH_KEY:
        return jsonify({"error": "Azure Speech key not configured. Set AZURE_SPEECH_KEY env var."}), 503

    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' field"}), 400

    text = _clean_text_for_tts(data["text"])
    speed_name = data.get("voice", "Normal")
    azure_voice = data.get("azureVoice", DEFAULT_AZURE_VOICE)
    rate = AZURE_SPEED_MAP.get(speed_name, "0%")

    # Build SSML
    ssml = f"""<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>
    <voice name='{azure_voice}'>
        <prosody rate='{rate}'>
            {_escape_xml(text)}
        </prosody>
    </voice>
</speak>"""

    url = f"https://{AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1"
    headers = {
        "Ocp-Apim-Subscription-Key": AZURE_SPEECH_KEY,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "riff-48khz-16bit-mono-pcm",
    }

    resp = requests.post(url, headers=headers, data=ssml.encode("utf-8"), timeout=30)

    if resp.status_code != 200:
        return jsonify({"error": f"Azure TTS failed ({resp.status_code}): {resp.text[:200]}"}), 502

    return Response(resp.content, mimetype="audio/wav")


def _escape_xml(text: str) -> str:
    """Escape special XML characters in user text."""
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;")
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5051, debug=True)
