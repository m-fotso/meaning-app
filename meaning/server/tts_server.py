from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import os
import tempfile
import wave
from piper import PiperVoice
from piper.config import SynthesisConfig

app = Flask(__name__)
CORS(app)

MODEL_DIR = os.path.expanduser("~/.local/share/piper")
MODEL_PATH = os.path.join(MODEL_DIR, "en_US-lessac-medium.onnx")

voice = PiperVoice.load(MODEL_PATH)

SPEED_MAP = {
    "Normal": 1.0,
    "Slow": 1.4,
    "Fast": 0.7,
}


@app.route("/tts", methods=["POST"])
def generate_tts():
    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' field"}), 400

    text = data["text"]
    speed_name = data.get("voice", "Normal")
    length_scale = SPEED_MAP.get(speed_name, 1.0)

    syn_config = SynthesisConfig(length_scale=length_scale)

    tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    tmp_path = tmp.name
    tmp.close()

    try:
        with wave.open(tmp_path, "wb") as wav:
            voice.synthesize_wav(text, wav, syn_config=syn_config)

        with open(tmp_path, "rb") as f:
            audio_data = f.read()

        return Response(audio_data, mimetype="audio/wav")
    finally:
        os.unlink(tmp_path)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5051, debug=True)
