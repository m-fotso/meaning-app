import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { db, storage } from './firebaseConfig';

export type TTSVoice = 'Slow' | 'Normal' | 'Fast';
export type TTSEngine = 'Piper' | 'Azure';
export type VoiceMap = Record<string, string>;

export const TTS_VOICES: TTSVoice[] = ['Slow', 'Normal', 'Fast'];
export const TTS_ENGINES: TTSEngine[] = ['Piper', 'Azure'];

const cacheDocId = (
  bookId: string,
  page: number,
  voice: TTSVoice,
  engine: TTSEngine,
  voiceId: string
) => `${bookId}_p${page}_${engine}_${voice}_${voiceId}`.replace(/[^a-zA-Z0-9_-]/g, '_');

const ttsBaseUrl = () =>
  (process.env.EXPO_PUBLIC_TTS_API_URL ?? 'http://localhost:5050').replace(/\/$/, '');

/** Optional: server exposes GET /tts/voices → { piper: VoiceMap, azure: VoiceMap } */
export async function fetchAvailableVoices(): Promise<{ piper: VoiceMap; azure: VoiceMap }> {
  try {
    const res = await fetch(`${ttsBaseUrl()}/tts/voices`);
    if (res.ok) {
      const data = (await res.json()) as { piper?: VoiceMap; azure?: VoiceMap };
      return {
        piper: data.piper ?? { default: 'Default' },
        azure: data.azure ?? { 'en-US-AriaNeural': 'Aria' },
      };
    }
  } catch {
    // offline / no server
  }
  return {
    piper: { default: 'Default (Piper)' },
    azure: { 'en-US-AriaNeural': 'Azure Neural' },
  };
}

export async function generateTTS(
  pageText: string,
  voice: TTSVoice,
  engine: TTSEngine,
  voiceId: string
): Promise<Blob> {
  const res = await fetch(`${ttsBaseUrl()}/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: pageText, voice, engine, voiceId }),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `TTS failed (${res.status})`);
  }
  return res.blob();
}

export async function getCachedAudio(
  userId: string,
  bookId: string,
  page: number,
  voice: TTSVoice,
  engine: TTSEngine,
  voiceId: string
): Promise<string | null> {
  const id = cacheDocId(bookId, page, voice, engine, voiceId);
  const snap = await getDoc(doc(db, 'users', userId, 'ttsCache', id));
  if (!snap.exists()) return null;
  const url = snap.data()?.url;
  return typeof url === 'string' ? url : null;
}

export async function uploadAudio(
  userId: string,
  bookId: string,
  page: number,
  voice: TTSVoice,
  audioBlob: Blob,
  engine: TTSEngine,
  voiceId: string
): Promise<string> {
  const id = cacheDocId(bookId, page, voice, engine, voiceId);
  const path = `users/${userId}/tts/${id}.wav`;
  const r = storageRef(storage, path);
  await uploadBytes(r, audioBlob);
  return getDownloadURL(r);
}

export async function saveTTSMetadata(
  userId: string,
  bookId: string,
  page: number,
  voice: TTSVoice,
  url: string,
  engine: TTSEngine,
  voiceId: string
): Promise<void> {
  const id = cacheDocId(bookId, page, voice, engine, voiceId);
  await setDoc(doc(db, 'users', userId, 'ttsCache', id), {
    bookId,
    page,
    voice,
    engine,
    voiceId,
    url,
    updatedAt: new Date().toISOString(),
  });
}
