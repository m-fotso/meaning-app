// services/notesService.ts
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc,
  deleteDoc,
  doc, 
  query, 
  where,
  orderBy 
} from "firebase/firestore";
import { db } from "./firebaseConfig";

type NoteData = {
  bookId: string;
  chapter?: number;
  highlightedText: string;
  userNote?: string;
  pageNumber?: number;
  color?: string;
};

type Note = NoteData & {
  id: string;
  createdAt: string;
};

// Save a new highlight/note
export const saveNote = async (userId: string, noteData: NoteData) => {
  try {
    const docRef = await addDoc(collection(db, "users", userId, "notes"), {
      ...noteData,
      createdAt: new Date().toISOString(),
    });
    return { success: true, noteId: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Get all notes for a user
export const getUserNotes = async (userId: string) => {
  try {
    const notesRef = collection(db, "users", userId, "notes");
    const q = query(notesRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const notes: Note[] = [];
    querySnapshot.forEach((doc) => {
      notes.push({ id: doc.id, ...doc.data() } as Note);
    });
    
    return { success: true, notes };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Get notes for a specific book
export const getNotesForBook = async (userId: string, bookId: string, chapter?: number) => {
  try {
    const notesRef = collection(db, "users", userId, "notes");
    let q;
    
    if (chapter) {
      q = query(notesRef, where("bookId", "==", bookId), where("chapter", "==", chapter));
    } else {
      q = query(notesRef, where("bookId", "==", bookId));
    }
    
    const querySnapshot = await getDocs(q);
    
    const notes: Note[] = [];
    querySnapshot.forEach((doc) => {
      notes.push({ id: doc.id, ...doc.data() } as Note);
    });
    
    return { success: true, notes };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Update a note
export const updateNote = async (userId: string, noteId: string, updatedData: Partial<NoteData>) => {
  try {
    const noteRef = doc(db, "users", userId, "notes", noteId);
    await updateDoc(noteRef, updatedData);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Delete a note
export const deleteNote = async (userId: string, noteId: string) => {
  try {
    const noteRef = doc(db, "users", userId, "notes", noteId);
    await deleteDoc(noteRef);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};