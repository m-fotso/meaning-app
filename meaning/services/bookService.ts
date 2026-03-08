// services/bookService.ts
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

export type BookData = {
  title: string;
  pdfPath: string;
  currentPage: number;
  totalPages: number;
  lastReadAt: string;
  addedAt: string;
};

export type Book = BookData & {
  id: string;
};

// Add a book to the user's collection
export const addBook = async (userId: string, bookData: Omit<BookData, "addedAt" | "lastReadAt" | "currentPage" | "totalPages">) => {
  try {
    const docRef = await addDoc(collection(db, "users", userId, "books"), {
      ...bookData,
      currentPage: 0,
      totalPages: 0,
      lastReadAt: new Date().toISOString(),
      addedAt: new Date().toISOString(),
    });
    return { success: true, bookId: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Get all books for a user
export const getUserBooks = async (userId: string) => {
  try {
    const booksRef = collection(db, "users", userId, "books");
    const q = query(booksRef, orderBy("addedAt", "desc"));
    const querySnapshot = await getDocs(q);

    const books: Book[] = [];
    querySnapshot.forEach((doc) => {
      books.push({ id: doc.id, ...doc.data() } as Book);
    });

    return { success: true, books };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Get a single book
export const getBook = async (userId: string, bookId: string) => {
  try {
    const bookRef = doc(db, "users", userId, "books", bookId);
    const bookSnap = await getDoc(bookRef);

    if (!bookSnap.exists()) {
      return { success: false, error: "Book not found" };
    }

    return { success: true, book: { id: bookSnap.id, ...bookSnap.data() } as Book };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Update book fields (currentPage, totalPages, lastReadAt, etc.)
export const updateBook = async (userId: string, bookId: string, data: Partial<BookData>) => {
  try {
    const bookRef = doc(db, "users", userId, "books", bookId);
    await updateDoc(bookRef, data);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Delete a book
export const deleteBook = async (userId: string, bookId: string) => {
  try {
    const bookRef = doc(db, "users", userId, "books", bookId);
    await deleteDoc(bookRef);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
