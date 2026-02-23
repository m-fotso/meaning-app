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

export const TTS_VOICES = [
  "Normal",
  "Slow",
  "Fast",
] as const;

export type TTSVoice = (typeof TTS_VOICES)[number];

export async function generateTTS(
  text: string,
  voice: TTSVoice
): Promise<Blob> {
  const response = await fetch(`${TTS_SERVER_URL}/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice }),
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
  audioBlob: Blob
): Promise<string> {
  const storagePath = `tts/${userId}/${bookId}/page-${page}-${voice}.wav`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, audioBlob);
  return await getDownloadURL(storageRef);
}

export async function saveTTSMetadata(
  userId: string,
  bookId: string,
  page: number,
  voice: TTSVoice,
  storageUrl: string
): Promise<void> {
  const col = collection(db, "users", userId, "tts");
  await addDoc(col, {
    bookId,
    page,
    voice,
    storageUrl,
    createdAt: serverTimestamp(),
  });
}

export async function getCachedAudio(
  userId: string,
  bookId: string,
  page: number,
  voice: TTSVoice
): Promise<string | null> {
  const col = collection(db, "users", userId, "tts");
  const q = query(
    col,
    where("bookId", "==", bookId),
    where("page", "==", page),
    where("voice", "==", voice)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data().storageUrl as string;
}
