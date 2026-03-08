# Changes Summary: `feat/book-firestore` + latest `main`

## Branch-Specific Changes (`feat/book-firestore`)

### New File: `meaning/services/bookService.ts`
Firebase service for managing a user's book collection stored in Firestore under `users/{userId}/books`.

- **`BookData` / `Book` types** — Data shape for books (title, pdfPath, currentPage, totalPages, lastReadAt, addedAt).
- **`addBook(userId, bookData)`** — Creates a new book document with default page tracking fields.
- **`getUserBooks(userId)`** — Returns all books for a user, ordered by `addedAt` descending.
- **`getBook(userId, bookId)`** — Fetches a single book document.
- **`updateBook(userId, bookId, data)`** — Partially updates book fields (e.g. currentPage, lastReadAt).
- **`deleteBook(userId, bookId)`** — Removes a book document.

### Modified: `meaning/app/book/[id].tsx`
- Imports `auth`, `getBook`, and `updateBook` from bookService.
- **Restore saved page**: On load, reads the user's last-read page from Firestore and jumps to it.
- **Auto-save page progress**: Debounced (500ms) write of `currentPage` and `lastReadAt` to Firestore on every page change.
- **Sync totalPages**: Updates `totalPages` in Firestore when the parsed PDF page count differs.

### Modified: `meaning/app/add-book.tsx`
- Integrates `addBook` from bookService so new books are saved to Firestore on creation.

### Modified: `meaning/app/home.tsx`
- Uses `getUserBooks` to fetch and display the user's book library from Firestore instead of local state.

---

## Changes Merged from `main`

### New File: `meaning/app/context/AuthContext.tsx`
React context + provider for Firebase auth state.

- **`AuthProvider`** — Wraps the app, listens to `onAuthChange`, and exposes `user` and `initializing`.
- **`useAuth()` hook** — Convenient access to the current auth state from any component.

### New File: `meaning/components/chapterNote.tsx`
Modal component for writing chapter-level notes/summaries.

- **`ChapterNote`** — Accepts `userId`, `bookId`, `currentPage`; saves notes via `saveNote()` from notesService.
- Shows a text input, handles saving state and errors, and calls `onSaveSuccess` callback after save.

### New File: `meaning/components/annotationMenu.tsx`
Slide-in annotation sidebar component (standalone version).

- **`AnnotationMenu`** — Right-edge swipe-to-open panel using `PanResponder` and `Animated`.
- Fetches notes for the current book/chapter via `getNotesForBook()`.
- Displays highlighted text and user notes in a scrollable list.

### New File: `meaning/app/reader.tsx`
Standalone reader screen with the `AnnotationMenu` embedded.

- Placeholder page that renders a `SafeAreaView` with scrollable content and the annotation sidebar.

### Modified: `meaning/app/_layout.tsx`
- Wraps entire app in `AuthProvider` so `useAuth()` works everywhere.
- Added `reader` route to the Stack navigator.

### Modified: `meaning/app/home.tsx`
- Added a temporary "Dev (Skip to reader)" button linking to `/reader`.

### Modified: `meaning/services/notesService.ts`
- `getNotesForBook` now accepts optional `chapter` parameter to filter notes by chapter.

### Modified: `meaning/app/book/[id].tsx` (from main)
- Integrated `Animated`, `PanResponder`, `Dimensions` for swipe-to-open annotation panel.
- Added `ChapterNote` modal integration with save-and-refresh flow.
- Fetches and displays notes from `notesService` in the annotation sidebar.
- Added web text selection tracking (`selectionchange` listener) for the "Interact" button.
