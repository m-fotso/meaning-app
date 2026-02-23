# Highlight and Search Feature — Feature Doc

This document describes the **highlighting** and **search-from-selection** feature in the book reader. It is intended for teammates who need to understand, extend, or integrate with this feature.

---

## 1. Overview

In the book reader (`app/book/[id].tsx`), users can:

- **Highlight** exact spans of text (not full lines). Highlights are stored per page and rendered in yellow.
- **Open a popup** on the selected phrase with actions: **Highlight**, **Copy**, **Search**.
- **Search** from the popup or from the Highlights list: open YouTube or Google with the phrase as the search query.
- **Unhighlight** by opening the popup from a highlighted span (click/long-press/right-click) and choosing **Unhighlight**.

Behavior differs slightly by platform (web vs mobile); see [User flows](#3-user-flows) below.

---

## 2. Where the Code Lives

| What | Location |
|------|----------|
| Book reader screen (all logic and UI) | `meaning/app/book/[id].tsx` |
| No separate components | Highlight popup, search modal, and segment rendering are inline in this file. |

---

## 3. User Flows

### Web

- **Select text:** Click and drag to select (normal browser selection). Text is selectable.
- **Open popup on a phrase:** Right-click a phrase → popup opens with that phrase.
- **Interact button (bottom bar):** After selecting text with the mouse, tap **Interact** → popup opens with the *last selected text* (selection is stored in a ref because the button click would otherwise clear it).
- **Highlight:** In the popup, choose **Highlight** → the *exact* selected/clicked text is added as a range highlight (yellow).
- **Unhighlight:** Click or right-click a *highlighted* span → popup opens with **Unhighlight** → removes that highlight.
- **Copy:** Copies the popup text to the clipboard (`expo-clipboard`).
- **Search:** Opens a second modal with **YouTube** and **Google** links that open in the browser with the phrase as the search query.

### Mobile

- **Open popup:** Long-press a phrase (or a highlighted span).
- **Interact button:** Not shown on mobile (web only).
- **Highlight / Unhighlight / Copy / Search:** Same as web, from the same popup and search modal.
- Text is not selectable by default; interaction is via long-press and popup.

### Bottom Bar

- **Prev / Interact (web only) / Annotate / Next**  
  **Interact** only appears on web and opens the popup with the last mouse selection (see `lastSelectionRef` and `selectionchange` listener).

---

## 4. Data Model (State)

All state is in `BookDetailScreen` in `app/book/[id].tsx`.

| State | Type | Purpose |
|-------|------|---------|
| `rangeHighlightsByPage` | `Record<number, Array<{ id: string; text: string }>>` | Highlights per page. Each highlight is the *exact* text plus a unique `id` (used for Unhighlight and for rendering). |
| `selectionPopup` | `{ segmentIndex: number \| null; text: string; rangeHighlightId?: string } \| null` | When non-null, the popup is open. `text` is the phrase shown. `segmentIndex` is set when the popup was opened from a segment (right-click/long-press); `rangeHighlightId` is set when opened from a *highlighted* span (so the popup shows Unhighlight). |
| `searchModal` | `{ query: string } \| null` | When non-null, the “Search for: …” modal is open (YouTube / Google links). |
| `lastSelectionRef` | `useRef<string>` | **Web only.** Holds the last non-empty text selection so the Interact button can use it after the click clears the selection. Updated in a `selectionchange` listener. |

When the PDF is re-fetched (e.g. `pdfPath` changes), `rangeHighlightsByPage` is reset to `{}` in the same effect that clears annotations.

---

## 5. How Highlighting Works (Exact Text Only)

- Highlights are **range-based**: we store `{ id, text }` per page. Only that exact substring is highlighted in the UI.
- Page text is split into **lines** (by `\n`), then each line into **segments** (sentences, with a max chunk length). Segments are used for:
  - Deciding what “phrase” to pass to the popup when the user right-clicks/long-presses (segment text).
  - Splitting the line so we can inject highlighted spans only where they match.

Rendering:

- For each segment we compute **which range highlights** appear as substrings (`getHighlightRangesForSegment`).
- We build disjoint ranges (overlaps are merged) and split the segment into normal and highlighted pieces.
- **Normal** pieces: same styling as body text; right-click/long-press opens the popup for that segment (Highlight/Copy/Search).
- **Highlighted** pieces: yellow style; click/long-press/right-click opens the popup with `rangeHighlightId` set so **Unhighlight** removes that highlight.

So: “highlight” = add `{ id, text }` to `rangeHighlightsByPage[currentPage]`; “unhighlight” = remove by `id`.

---

## 6. Key Functions / Helpers

| Name | Purpose |
|------|---------|
| `buildDisplayItems(pageText)` | Splits page text into items: segments (with index) and newlines. Used to preserve PDF line breaks and to iterate segments. |
| `splitLineIntoSegments(line)` | Splits a single line into segments (sentences; long runs capped at `maxChunkLen`). |
| `getHighlightRangesForSegment(segmentText)` | Returns disjoint `{ start, end, id, text }` ranges for the current page’s range highlights that appear inside `segmentText`. |
| `renderSegment(segmentText, segmentIndex, keyPrefix)` | Renders one segment: either one `<Text>` (no highlights) or multiple `<Text>`s for normal + highlighted spans. Handles right-click/long-press and click-on-highlight to open popup. |
| `addRangeHighlight(text)` | Appends `{ id, text }` to `rangeHighlightsByPage[currentPage]` and closes the popup. |
| `removeRangeHighlight(id)` | Removes the highlight with that `id` from the current page and closes the popup. |
| `handlePopupHighlight()` | If popup has `rangeHighlightId` → Unhighlight (remove). Otherwise → Highlight (add). |
| `getWebSelection()` | **Web only.** Returns `window.getSelection()?.toString()?.trim() ?? ''`. |
| `openSearchModal(query)` / `openYouTubeSearch` / `openGoogleSearch` | Open the search modal or open YouTube/Google in the browser with the given query. |

---

## 7. Annotations Panel — “Highlights” Section

- When `currentRangeHighlights.length > 0`, a **Highlights** section is shown for the current page.
- Each item shows the highlight text and a **Search** button.
- Tapping the highlight text opens the same popup (with `rangeHighlightId` set) so the user can **Unhighlight** or Copy/Search.
- Search opens the same YouTube/Google modal for that highlight’s text.

---

## 8. Dependencies

- **expo-clipboard** — Copy in the popup.
- **Linking** (from `react-native`) — Open YouTube/Google URLs.
- **Platform** — Branching for web (selectable text, right-click, Interact button, `lastSelectionRef` / `selectionchange`).
- **Modal**, **Pressable**, **Text**, **View** — UI for popup, search modal, and segment/highlight rendering.

---

## 9. Platform-Specific Details

- **Web**
  - Text is selectable (`selectable={Platform.OS === 'web'}`).
  - Popup can be opened by **right-click** on a phrase or **click** on a highlighted span.
  - **Interact** button is shown and uses `lastSelectionRef` + `selectionchange` so the last mouse selection is still available when the button is pressed.
- **Mobile**
  - Text is not selectable; popup is opened by **long-press** on a phrase or on a highlighted span.
  - Interact button is not rendered.

Instruction text under the page is platform-specific:

- Web: *“Select text with the mouse, or right-click a phrase to highlight or search”*
- Mobile: *“Long-press any phrase to highlight or search”*

---

## 10. Possible Extensions (for future work)

- **Persistence:** `rangeHighlightsByPage` is in-memory only. It could be synced to a backend or local storage keyed by book/page (and optionally user).
- **Highlight color:** Currently a single yellow style (`styles.highlightText`). Could add a color field to `{ id, text }` and use it in rendering.
- **Search:** Replace or augment “open YouTube/Google” with an in-app search UI or API (e.g. definitions, recommended readings).
- **Cross-page highlights:** If a selection spans two pages, currently we only support highlights that lie within a single segment; cross-segment or cross-page ranges would require a different storage and rendering approach.

---

## 11. Quick Reference — Opening the Popup

| Trigger | `segmentIndex` | `rangeHighlightId` | Popup shows |
|--------|----------------|---------------------|------------|
| Right-click / long-press on normal text | segment index | — | Highlight, Copy, Search |
| Interact button (web) with selection | `null` | — | Highlight, Copy, Search |
| Click / long-press / right-click on highlighted span | `null` | id | **Unhighlight**, Copy, Search |
| Tap a highlight in the Annotations panel | `null` | id | **Unhighlight**, Copy, Search |

Highlight = add exact text as range highlight. Unhighlight = remove by `rangeHighlightId`.
