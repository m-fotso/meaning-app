import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, storage } from "./firebaseConfig";

const TTS_SERVER_URL = "http://localhost:5051";

// Speed options
export const TTS_VOICES = ["Normal", "Slow", "Fast"] as const;
export type TTSVoice = (typeof TTS_VOICES)[number];

// Engine options
export const TTS_ENGINES = ["Piper", "Azure"] as const;
export type TTSEngine = (typeof TTS_ENGINES)[number];

// Voice maps: voiceId -> friendly display name
export type VoiceMap = Record<string, string>;

/** Fetch available voices from the TTS server. */
export async function fetchAvailableVoices(): Promise<{
  piper: VoiceMap;
  azure: VoiceMap;
}> {
  try {
    const resp = await fetch(`${TTS_SERVER_URL}/voices`);
    if (!resp.ok) throw new Error("Failed to fetch voices");
    return await resp.json();
  } catch {
    // Fallback defaults if server is unreachable
    return {
      piper: { "en_US-lessac-medium": "Lessac Medium (en_US)" },
      azure: {
        "en-US-AvaMultilingualNeural": "Ava (Female, HD)",
        "en-US-AndrewMultilingualNeural": "Andrew (Male, HD)",
        "en-US-EmmaMultilingualNeural": "Emma (Female, HD)",
        "en-US-BrianMultilingualNeural": "Brian (Male, HD)",
        "en-US-JennyMultilingualNeural": "Jenny (Female)",
        "en-US-AriaNeural": "Aria (Female)",
        "en-US-GuyNeural": "Guy (Male)",
        "en-US-DavisNeural": "Davis (Male)",
      },
    };
  }
}

export async function generateTTS(
  text: string,
  voice: TTSVoice,
  engine: TTSEngine = "Piper",
  voiceId?: string
): Promise<Blob> {
  const endpoint = engine === "Azure" ? "/tts/azure" : "/tts";
  const body: Record<string, string> = { text, voice };
  if (engine === "Azure" && voiceId) {
    body.azureVoice = voiceId;
  } else if (engine === "Piper" && voiceId) {
    body.piperVoice = voiceId;
  }

  const response = await fetch(`${TTS_SERVER_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`TTS generation failed: ${err}`);
  }

  return await response.blob();
}

export async function uploadAudio(
  userId: string,
  bookId: string,
  page: number,
  voice: TTSVoice,
  audioBlob: Blob,
  engine: TTSEngine = "Piper",
  voiceId: string = ""
): Promise<string> {
  const vId = voiceId || "default";
  const storagePath = `tts/${userId}/${bookId}/page-${page}-${voice}-${engine}-${vId}.wav`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, audioBlob);
  return await getDownloadURL(storageRef);
}

export async function saveTTSMetadata(
  userId: string,
  bookId: string,
  page: number,
  voice: TTSVoice,
  storageUrl: string,
  engine: TTSEngine = "Piper",
  voiceId: string = ""
): Promise<void> {
  const col = collection(db, "users", userId, "tts");
  await addDoc(col, {
    bookId,
    page,
    voice,
    engine,
    voiceId: voiceId || "default",
    storageUrl,
    createdAt: serverTimestamp(),
  });
}

export async function getCachedAudio(
  userId: string,
  bookId: string,
  page: number,
  voice: TTSVoice,
  engine: TTSEngine = "Piper",
  voiceId: string = ""
): Promise<string | null> {
  const col = collection(db, "users", userId, "tts");
  const q = query(
    col,
    where("bookId", "==", bookId),
    where("page", "==", page),
    where("voice", "==", voice),
    where("engine", "==", engine),
    where("voiceId", "==", voiceId || "default")
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data().storageUrl as string;
}
