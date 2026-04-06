import { ChapterNote } from '@/components/chapterNote';
import { useAuth } from '@/context/AuthContext';
import { getNotesForBook, Note } from '@/services/notesService';
import Slider from '@react-native-community/slider';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Linking,
  Modal,
  PanResponder,
  PanResponderGestureState,
  PanResponderInstance,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { getBook, updateBook } from '../../services/bookService';
import { auth } from '../../services/firebaseConfig';


const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MENU_WIDTH = Math.min(320, SCREEN_WIDTH * 0.8);

export default function BookDetailScreen() {
  const router = useRouter();
  const { user, initializing } = useAuth();
  const { title, id, pdfPath } = useLocalSearchParams<{
    title?: string;
    id?: string;
    pdfPath?: string;
  }>();
  const displayTitle = title ?? `Book ${id ?? ''}`;
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0)
  const [newestPage, setNewestPage] = useState<number>(-1);
  const [chapterPages, setChapterPages] = useState<number[]>([]);;
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [annotationsByPage, setAnnotationsByPage] = useState<Record<number, string[]>>({});
  const [newAnnotation, setNewAnnotation] = useState('');
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [fetchedNotes, setFetchedNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const currentAnnotations = annotationsByPage[currentPage] ?? [];
  const [showChapterNote, setShowChapterNote] = useState(false);
  

  // Swipe and animation refs
  const menuAnimRef = useRef<Animated.Value>(new Animated.Value(0)).current;
  const panResponderRef = useRef<PanResponderInstance | null>(null);
  /// Chapter detection from page text
  const getNewestChapterPage = (pages: string[]): number => {
    let newestPage = -1;

    const chapterRegex = /\b(chapter\s+\d+|chapter\s+[ivxlcdm]+)\b/i;

    pages.forEach((pageText, index) => {
      if (chapterRegex.test(pageText)) {
        newestPage = index;
      }
    });
    console.log(newestPage);
    return newestPage;
  };
  
  // Get list of page indices that contain chapter headings, for chapter note association and quick navigation
  const getChapterPages = (pages: string[]): number[] => {
    const chapterRegex = /\b(chapter\s+\d+|chapter\s+[ivxlcdm]+)\b/i;
    const chapterPages: number[] = [];

    pages.forEach((pageText, index) => {
      if (chapterRegex.test(pageText)) {
        chapterPages.push(index);
      }
    });
    console.log(chapterPages);
    return chapterPages;
  };

  // Range highlights: page -> list of { id, text } (exact text only, not full segment)
  const [rangeHighlightsByPage, setRangeHighlightsByPage] = useState<
    Record<number, Array<{ id: string; text: string }>>
  >({});
  // Pop-up when user long-presses/right-clicks a segment, or opens from bottom bar, or clicks a highlight
  const [selectionPopup, setSelectionPopup] = useState<{
    segmentIndex: number | null;
    text: string;
    rangeHighlightId?: string;
  } | null>(null);
  // Search modal: show YouTube/Google links for selected text
  const [searchModal, setSearchModal] = useState<{ query: string } | null>(null);
  // Debounce timer for saving page progress to Firestore
  const savePageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [savedPageRestored, setSavedPageRestored] = useState(false);

  // On web: keep last non-empty selection so the Selection button still has it after click clears it
  const lastSelectionRef = useRef('');

  useEffect(() => {
    const path = typeof pdfPath === 'string' ? pdfPath : '';
    if (!path) {
      return;
    }

    const fetchText = async () => {
      try {
        setLoading(true);
        setError(null);
        setStartTime(Date.now());
        setElapsedMs(0);
        const response = await fetch('http://localhost:5050/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path }),
        });

        if (!response.ok) {
          throw new Error(`Parse failed: ${response.status}`);
        }

        const data = await response.json();
        const rawText = typeof data.text === 'string' ? data.text : '';
        const parts = rawText
          .split(/--\s*\d+\s+of\s+\d+\s*--/g)
          .map((part: string) => part.trim())
          .filter(Boolean);
        const nextPages = parts.length ? parts : rawText ? [rawText] : [];
        setPages(nextPages);
        setCurrentPage(0);
        setAnnotationsByPage({});
        setRangeHighlightsByPage({});
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load PDF text.');
      } finally {
        setLoading(false);
        setStartTime(null);
      }
    };

    fetchText();
  }, [pdfPath]);

  // Restore saved page from Firestore after pages are loaded
  useEffect(() => {
    if (pages.length === 0 || savedPageRestored) return;
    const userId = auth.currentUser?.uid;
    const bookId = id;
    if (!userId || !bookId) {
      setSavedPageRestored(true);
      return;
    }
    getBook(userId, bookId).then((result) => {
      if (result.success && result.book) {
        const saved = result.book.currentPage;
        if (saved > 0 && saved < pages.length) {
          setCurrentPage(saved);
        }
        // Save totalPages if it changed
        if (result.book.totalPages !== pages.length) {
          updateBook(userId, bookId, { totalPages: pages.length });
        }
      } else {
        // Book doc doesn't exist yet — save totalPages
        updateBook(userId, bookId, { totalPages: pages.length }).catch(() => { });
      }
      setSavedPageRestored(true);
    });
  }, [pages.length, savedPageRestored, id]);

  // Debounced save of currentPage to Firestore on page change
  useEffect(() => {
    if (!savedPageRestored) return;
    const userId = auth.currentUser?.uid;
    const bookId = id;
    if (!userId || !bookId) return;

    if (savePageTimerRef.current) clearTimeout(savePageTimerRef.current);
    savePageTimerRef.current = setTimeout(() => {
      updateBook(userId, bookId, {
        currentPage,
        lastReadAt: new Date().toISOString(),
      });
    }, 500);

    return () => {
      if (savePageTimerRef.current) clearTimeout(savePageTimerRef.current);
    };
  }, [currentPage, savedPageRestored, id]);

  useEffect(() => {
    if (!loading || startTime === null) {
      return;
    }
    const intervalId = setInterval(() => {
      setElapsedMs(Date.now() - startTime);
    }, 200);
    return () => clearInterval(intervalId);
  }, [loading, startTime]);

  // Animation effect for menu slide-in/out
  useEffect(() => {
    Animated.timing(menuAnimRef, {
      toValue: showAnnotations ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [showAnnotations, menuAnimRef]);

  // Fetch notes from service
  useEffect(() => {
    if (initializing) {
      return;
    }
    if (!user || !id) {
      setFetchedNotes([]);
      return;
    }

    let mounted = true;
    const fetchNotes = async () => {
      setNotesLoading(true);
      const result = await getNotesForBook(user.uid, String(id), currentPage);
      if (!mounted) return;
      if (result.success && result.notes) {
        setFetchedNotes(result.notes);
      } else {
        console.error('Failed to fetch notes:', result.error);
        setFetchedNotes([]);
      }
      setNotesLoading(false);
    };
    fetchNotes();

    return () => {
      mounted = false;
    };
  }, [user, initializing, id, currentPage]);

  // Initialize PanResponder for left-swipe detection
  useEffect(() => {
    panResponderRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_evt, gestureState: PanResponderGestureState) => {
        return Math.abs(gestureState.dx) > 6 && Math.abs(gestureState.dy) < 30;
      },
      onPanResponderRelease: (_evt, gestureState: PanResponderGestureState) => {
        if (gestureState.dx < -50) {
          setShowAnnotations(true);
        }
      },
    });
  }, []);

  // Animation effect for menu slide-in/out
  useEffect(() => {
    Animated.timing(menuAnimRef, {
      toValue: showAnnotations ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [showAnnotations, menuAnimRef]);

  // Fetch notes from service
  useEffect(() => {
    if (initializing) {
      return;
    }
    if (!user || !id) {
      setFetchedNotes([]);
      return;
    }

    let mounted = true;
    const fetchNotes = async () => {
      setNotesLoading(true);
      const result = await getNotesForBook(user.uid, String(id), currentPage);
      if (!mounted) return;
      if (result.success && result.notes) {
        setFetchedNotes(result.notes);
      } else {
        console.error('Failed to fetch notes:', result.error);
        setFetchedNotes([]);
      }
      setNotesLoading(false);
    };
    fetchNotes();

    return () => {
      mounted = false;
    };
  }, [user, initializing, id, currentPage]);

  // Initialize PanResponder for left-swipe detection
  useEffect(() => {
    panResponderRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_evt, gestureState: PanResponderGestureState) => {
        return Math.abs(gestureState.dx) > 6 && Math.abs(gestureState.dy) < 30;
      },
      onPanResponderRelease: (_evt, gestureState: PanResponderGestureState) => {
        if (gestureState.dx < -50) {
          setShowAnnotations(true);
        }
      },
    });
  }, []);

  //find current page and chapter
  useEffect(() => {
    setChapterPages(getChapterPages(pages));
  }, [pages]);
  
  const prevPageRef = useRef(0);
  const hasInitializedChapterWatcherRef = useRef(false);

  useEffect(() => {
  if (!hasInitializedChapterWatcherRef.current) {
    hasInitializedChapterWatcherRef.current = true;
    prevPageRef.current = currentPage;
    return;
  }

  const movedToDifferentPage = currentPage !== prevPageRef.current;
  const enteredChapterStart = chapterPages.includes(currentPage);

  if (movedToDifferentPage && enteredChapterStart) {
    setShowChapterNote(true);
  }

  prevPageRef.current = currentPage;
}, [currentPage, chapterPages]);



  const handleAddAnnotation = () => {
    const trimmed = newAnnotation.trim();
    if (!trimmed.length) {
      return;
    }
    setAnnotationsByPage((prev) => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] ?? []), trimmed],
    }));
    setNewAnnotation('');
    setIsAddingAnnotation(false);
  };


  
  const maxChunkLen = 120;

  // Split a single line into segments (sentences; cap length for long runs)
  const splitLineIntoSegments = useCallback((line: string): string[] => {
    const trimmed = line.trim();
    if (!trimmed) return [];
    const bySentence = trimmed.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
    const segments: string[] = [];
    for (const s of bySentence.length > 0 ? bySentence : [trimmed]) {
      if (s.length <= maxChunkLen) {
        segments.push(s);
      } else {
        for (let i = 0; i < s.length; i += maxChunkLen) {
          const chunk = s.slice(i, i + maxChunkLen).trim() || s.slice(i, i + maxChunkLen);
          if (chunk) segments.push(chunk);
        }
      }
    }
    return segments.length > 0 ? segments : [trimmed];
  }, []);

  // Build display items for the page: segments and newlines, so we preserve PDF line breaks
  const buildDisplayItems = useCallback(
    (pageText: string): Array<{ type: 'segment'; index: number; text: string } | { type: 'newline' }> => {
      const items: Array<{ type: 'segment'; index: number; text: string } | { type: 'newline' }> = [];
      let index = 0;
      const lines = pageText.split('\n');
      for (const line of lines) {
        const segs = splitLineIntoSegments(line);
        for (const text of segs) {
          items.push({ type: 'segment', index: index++, text });
        }
        items.push({ type: 'newline' });
      }
      return items;
    },
    [splitLineIntoSegments]
  );

  const addRangeHighlight = (text: string) => {
    const id = `hl-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setRangeHighlightsByPage((prev) => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] ?? []), { id, text }],
    }));
    setSelectionPopup(null);
  };

  const removeRangeHighlight = (id: string) => {
    setRangeHighlightsByPage((prev) => ({
      ...prev,
      [currentPage]: (prev[currentPage] ?? []).filter((h) => h.id !== id),
    }));
    setSelectionPopup(null);
  };

  const handleCopy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    setSelectionPopup(null);
  };

  const openGeneratedImageModal = (query: string) => {
    setSelectionPopup(null);
    //trigger image generation/put API call here 
    //query is the text that has been highlighted to create the image
  };

  const openSearchModal = (query: string) => {
    setSelectionPopup(null);
    setSearchModal({ query });
  };

  const openYouTubeSearch = (query: string) => {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    Linking.openURL(url);
    setSearchModal(null);
  };

  const openGoogleSearch = (query: string) => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    Linking.openURL(url);
    setSearchModal(null);
  };

  const getWebSelection = (): string => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return '';
    const sel = window.getSelection?.();
    return (sel?.toString?.() ?? '').trim();
  };

  // On web, keep the last non-empty selection in a ref so the Selection button can use it
  // (clicking the button clears the selection before onPress runs)
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const onSelectionChange = () => {
      const sel = getWebSelection();
      if (sel) lastSelectionRef.current = sel;
    };
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, []);

  const handlePopupHighlight = () => {
    if (!selectionPopup) return;
    if (selectionPopup.rangeHighlightId) {
      removeRangeHighlight(selectionPopup.rangeHighlightId);
    } else {
      addRangeHighlight(selectionPopup.text);
    }
  };

  const displayItems = pages[currentPage] ? buildDisplayItems(pages[currentPage]) : [];
  const currentRangeHighlights = rangeHighlightsByPage[currentPage] ?? [];
  const currentPageSegments = displayItems
    .filter((x): x is { type: 'segment'; index: number; text: string } => x.type === 'segment')
    .map((x) => x.text);

  // Get disjoint (start, end, id, text) ranges for a segment from range highlights (exact substring matches)
  const getHighlightRangesForSegment = useCallback(
    (segmentText: string): Array<{ start: number; end: number; id: string; text: string }> => {
      const ranges: Array<{ start: number; end: number; id: string; text: string }> = [];
      for (const h of currentRangeHighlights) {
        let idx = 0;
        while (idx < segmentText.length) {
          const pos = segmentText.indexOf(h.text, idx);
          if (pos === -1) break;
          ranges.push({ start: pos, end: pos + h.text.length, id: h.id, text: h.text });
          idx = pos + 1;
        }
      }
      ranges.sort((a, b) => a.start - b.start);
      const disjoint: typeof ranges = [];
      for (const r of ranges) {
        const last = disjoint[disjoint.length - 1];
        if (last && r.start < last.end) {
          if (r.end > last.end) {
            disjoint.push({ start: last.end, end: r.end, id: r.id, text: segmentText.slice(last.end, r.end) });
          }
          continue;
        }
        disjoint.push({ ...r, text: segmentText.slice(r.start, r.end) });
      }
      return disjoint;
    },
    [currentRangeHighlights]
  );

  const renderSegment = (segmentText: string, segmentIndex: number, keyPrefix: string) => {
    const ranges = getHighlightRangesForSegment(segmentText);
    if (ranges.length === 0) {
      return (
        <Text
          key={keyPrefix}
          selectable={Platform.OS === 'web'}
          onLongPress={() => setSelectionPopup({ segmentIndex, text: segmentText })}
          {...(Platform.OS === 'web' && {
            onContextMenu: (e: { preventDefault: () => void }) => {
              e.preventDefault();
              setSelectionPopup({ segmentIndex, text: segmentText });
            },
          })}
          style={styles.body}
        >
          {segmentText}{' '}
        </Text>
      );
    }
    const parts: Array<{ start: number; end: number; id?: string; text: string }> = [];
    let pos = 0;
    for (const r of ranges) {
      if (r.start > pos) parts.push({ start: pos, end: r.start, text: segmentText.slice(pos, r.start) });
      parts.push({ start: r.start, end: r.end, id: r.id, text: r.text });
      pos = r.end;
    }
    if (pos < segmentText.length) parts.push({ start: pos, end: segmentText.length, text: segmentText.slice(pos) });
    return (
      <Text key={keyPrefix} style={styles.body}>
        {parts.map((part, j) =>
          part.id ? (
            <Text
              key={`${keyPrefix}-${j}`}
              selectable={Platform.OS === 'web'}
              onLongPress={() =>
                setSelectionPopup({ segmentIndex: null, text: part.text, rangeHighlightId: part.id })
              }
              onPress={
                Platform.OS === 'web'
                  ? () => setSelectionPopup({ segmentIndex: null, text: part.text, rangeHighlightId: part.id })
                  : undefined
              }
              {...(Platform.OS === 'web' && {
                onContextMenu: (e: { preventDefault: () => void }) => {
                  e.preventDefault();
                  setSelectionPopup({ segmentIndex: null, text: part.text, rangeHighlightId: part.id });
                },
              })}
              style={[styles.body, styles.highlightText]}
            >
              {part.text}
            </Text>
          ) : (
            <Text
              key={`${keyPrefix}-${j}`}
              selectable={Platform.OS === 'web'}
              onLongPress={() => setSelectionPopup({ segmentIndex, text: segmentText })}
              {...(Platform.OS === 'web' && {
                onContextMenu: (e: { preventDefault: () => void }) => {
                  e.preventDefault();
                  setSelectionPopup({ segmentIndex, text: segmentText });
                },
              })}
              style={styles.body}
            >
              {part.text}
            </Text>
          )
        )}
        {' '}
      </Text>
    );
  };

  const renderText = (text: string) => {
    const items = buildDisplayItems(text);
    if (items.length === 0) return <Text style={styles.body}>{text}</Text>;
    return (
      <Text style={styles.body}>
        {items.map((item, i) =>
          item.type === 'newline' ? (
            '\n'
          ) : (
            renderSegment(item.text, item.index, `seg-${item.index}-${i}`)
          )
        )}
      </Text>
    );
  };

  return (
    <View style={styles.screen}>
      {/* Right-edge invisible swipe zone for gesture detection */}
      {panResponderRef.current && (
        <View style={styles.swipeZone} {...panResponderRef.current.panHandlers} />
      )}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>





        <Text style={styles.title}>{displayTitle}</Text>
        {(annotationsByPage[currentPage]?.length ?? 0) > 0 ? (
          <Pressable
            style={styles.seeAnnotationsButton}
            onPress={() => {
              setShowAnnotations(true);
            }}
          >
            <Text style={styles.seeAnnotationsText}>See annotations</Text>
          </Pressable>
        ) : null}
        {loading ? (
          <Text style={styles.subtitle}>
            Loading PDF... {(elapsedMs / 1000).toFixed(1)}s
          </Text>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!loading && !error && pages.length ? (
          <View style={styles.pageList}>
            <View style={styles.pageContent}>
              {renderText(pages[currentPage])}
            </View>
            <Text style={styles.pageIndicator}>
              Page {currentPage + 1} of {pages.length}
            </Text>
            <Text style={styles.longPressHint}>
              {Platform.OS === 'web'
                ? 'Select text with the mouse, or right-click a phrase to highlight or search'
                : 'Long-press any phrase to highlight or search'}
            </Text>
          </View>
        ) : (
          !loading &&
          !error && <Text style={styles.subtitle}>Book detail page</Text>
        )}
      </ScrollView>
      {showAnnotations ? (
        <>
          <Pressable style={styles.overlay} onPress={() => setShowAnnotations(false)} />
          <View style={styles.annotationsOverlay}>
            <Animated.View
              style={[
                styles.annotationsPanel,
                {
                  width: MENU_WIDTH,
                  transform: [
                    {
                      translateX: menuAnimRef.interpolate({
                        inputRange: [0, 1],
                        outputRange: [MENU_WIDTH, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.annotationsHeader}>
                <View>
                  <Text style={styles.annotationsTitle}>Annotations</Text>
                  <Text style={styles.annotationsSubtitle}>
                    Page {currentPage + 1} of {pages.length}
                  </Text>
                </View>
                <Pressable style={styles.addAnnotationButton} onPress={() => setIsAddingAnnotation(true)}>
                  <Text style={styles.addAnnotationText}>+</Text>
                </Pressable>
              </View>
              {isAddingAnnotation ? (
                <View style={styles.annotationInputRow}>
                  <TextInput
                    value={newAnnotation}
                    onChangeText={setNewAnnotation}
                    placeholder="Type an annotation"
                    placeholderTextColor="#777777"
                    style={styles.annotationInput}
                    multiline
                  />
                  <View style={styles.annotationInputActions}>
                    <Pressable style={styles.annotationSaveButton} onPress={handleAddAnnotation}>
                      <Text style={styles.annotationSaveText}>Add</Text>
                    </Pressable>
                    <Pressable
                      style={styles.annotationCancelButton}
                      onPress={() => {
                        setNewAnnotation('');
                        setIsAddingAnnotation(false);
                      }}
                    >
                      <Text style={styles.annotationCancelText}>Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
              <View style={styles.annotationNav}>
                <Pressable
                  style={[styles.annotationArrow, currentPage === 0 && styles.pageButtonDisabled]}
                  onPress={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                >
                  <Text style={styles.annotationArrowText}>‹</Text>
                </Pressable>
                <Text style={styles.annotationCount}>Page {currentPage + 1}</Text>
                <Pressable
                  style={[
                    styles.annotationArrow,
                    currentPage >= pages.length - 1 && styles.pageButtonDisabled,
                  ]}
                  onPress={() => setCurrentPage((prev) => Math.min(pages.length - 1, prev + 1))}
                  disabled={currentPage >= pages.length - 1}
                >
                  <Text style={styles.annotationArrowText}>›</Text>
                </Pressable>
              </View>
              <ScrollView style={styles.annotationsList} keyboardShouldPersistTaps="handled">
                {currentAnnotations.length ? (
                  currentAnnotations.map((annotation, index) => (
                    <View key={index} style={styles.annotationCard}>
                      <Text style={styles.annotationText}>{annotation}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.annotationsEmpty}>No annotations yet.</Text>
                )}
                {notesLoading && <Text style={styles.loadingText}>Loading notes…</Text>}
                {!notesLoading && fetchedNotes.length > 0 && (
                  <View style={styles.fetchedNotesSection}>
                    <Text style={styles.fetchedNotesTitle}>Service Notes</Text>
                    {fetchedNotes.map((note) => (
                      <View key={note.id} style={styles.fetchedNoteCard}>
                        <Text style={styles.fetchedNoteText}>{note.highlightedText}</Text>
                        {note.userNote && <Text style={styles.noteContent}>{note.userNote}</Text>}
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>
              {currentRangeHighlights.length > 0 ? (
                <View style={styles.highlightsSection}>
                  <Text style={styles.highlightsTitle}>Highlights</Text>
                  {currentRangeHighlights.map((h) => (
                    <View key={h.id} style={styles.highlightItem}>
                      <Pressable
                        onPress={() =>
                          setSelectionPopup({ segmentIndex: null, text: h.text, rangeHighlightId: h.id })
                        }
                        style={styles.highlightItemTextWrap}
                      >
                        <Text style={styles.highlightItemText} numberOfLines={2}>{h.text}</Text>
                      </Pressable>
                      <Pressable
                        style={styles.highlightSearchButton}
                        onPress={() => openSearchModal(h.text)}
                      >
                        <Text style={styles.highlightSearchButtonText}>Search</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              ) : null}
              <View style={styles.pageSlider}>
                <Text style={styles.pageSliderLabel}>Jump to page {currentPage + 1}</Text>
                <Slider
                  minimumValue={0}
                  maximumValue={Math.max(0, pages.length - 1)}
                  step={1}
                  value={currentPage}
                  onValueChange={(value: number) => setCurrentPage(Math.round(value))}
                  minimumTrackTintColor="#FFFFFF"
                  maximumTrackTintColor="#333333"
                  thumbTintColor="#FFFFFF"
                />
              </View>
            </Animated.View>
          </View>
        </>
      ) : null}

      {/* Chapter Notes Modal */}
      <ChapterNote
        visible={showChapterNote}
        onClose={() => setShowChapterNote(false)}
        userId={user?.uid ?? ''}
        bookId={String(id)}
        currentPage={currentPage}
        
        onSaveSuccess={() => {
          // Refetch notes after save
          if (user && id) {
            getNotesForBook(user.uid, String(id), currentPage).then((result) => {
              if (result.success && result.notes) {
                setFetchedNotes(result.notes);
              }
            });
          }
        }}
      />

      {/* Selection pop-up: Highlight / Copy / Search */}
      <Modal visible={selectionPopup !== null} transparent animationType="fade">
        <Pressable style={styles.highlightOverlay} onPress={() => setSelectionPopup(null)}>
          <Pressable style={styles.highlightCard} onPress={(e) => e.stopPropagation()}>
            {selectionPopup ? (
              <>
                <Text style={styles.highlightTitle} numberOfLines={3}>
                  "{selectionPopup.text}"
                </Text>
                <View style={styles.popupActions}>
                  <Pressable style={styles.popupButton} onPress={handlePopupHighlight}>
                    <Text style={styles.popupButtonText}>
                      {selectionPopup.rangeHighlightId ? 'Unhighlight' : 'Highlight'}
                    </Text>
                  </Pressable>
                  <Pressable style={styles.popupButton} onPress={() => handleCopy(selectionPopup.text)}>
                    <Text style={styles.popupButtonText}>Copy</Text>
                  </Pressable>
                  <Pressable style={styles.popupButton} onPress={() => openSearchModal(selectionPopup.text)}>
                    <Text style={styles.popupButtonText}>Search</Text>
                  </Pressable>
                  {/* <Pressable style={styles.popupButton} onPress={() => openGeneratedImageModal(selectionPopup.text)}>
                    <Text style={styles.popupButtonText}>Generate Image</Text>
                  </Pressable> */}
                </View>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Search modal: YouTube / Google links for selected text */}
      <Modal visible={searchModal !== null} transparent animationType="fade">
        <Pressable style={styles.highlightOverlay} onPress={() => setSearchModal(null)}>
          <Pressable style={styles.highlightCard} onPress={(e) => e.stopPropagation()}>
            {searchModal ? (
              <>
                <Text style={styles.highlightTitle}>Search for: "{searchModal.query}"</Text>
                <View style={styles.popupActions}>
                  <Pressable
                    style={styles.popupButton}
                    onPress={() => openYouTubeSearch(searchModal.query)}
                  >
                    <Text style={styles.popupButtonText}>YouTube</Text>
                  </Pressable>
                  <Pressable
                    style={styles.popupButton}
                    onPress={() => openGoogleSearch(searchModal.query)}
                  >
                    <Text style={styles.popupButtonText}>Google</Text>
                  </Pressable>
                </View>
                <Pressable style={styles.popupCancelButton} onPress={() => setSearchModal(null)}>
                  <Text style={styles.popupCancelText}>Close</Text>
                </Pressable>
                

              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>

      <View style={styles.actionBar}>
        <Pressable
          style={[styles.actionButton, currentPage === 0 && styles.actionButtonDisabled]}
          onPress={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
          disabled={currentPage === 0}
        >
          <Text style={styles.actionText}>Prev</Text>
        </Pressable>
        {Platform.OS === 'web' ? (
          <Pressable
            style={styles.actionButton}
            onPress={() => {
              const sel = lastSelectionRef.current || getWebSelection();
              if (sel) setSelectionPopup({ segmentIndex: null, text: sel });
            }}
          >
            <Text style={styles.actionText}>Interact</Text>
          </Pressable>
        ) : null}
        <Pressable style={styles.actionButton} onPress={() => setShowAnnotations((prev) => !prev)}>
          <Text style={styles.actionText}>Annotate</Text>
        </Pressable>
          
        <Pressable
          style={[
            styles.actionButton,
            currentPage === pages.length - 1 && styles.actionButtonDisabled,
          ]}
          onPress={() => setCurrentPage((prev) => Math.min(pages.length - 1, prev + 1))}
          disabled={currentPage === pages.length - 1}
        >
          <Text style={styles.actionText}>Next</Text>
        </Pressable>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flexGrow: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 120,
    backgroundColor: '#000000',
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 24,
    borderRadius: 6,
    backgroundColor: '#1A1A1A',
  },
  backText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  seeAnnotationsButton: {
    marginTop: 4,
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#1A1A1A',
  },
  seeAnnotationsText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  pageList: {
    width: '100%',
    paddingTop: 8,
    position: 'relative',
  },
  pageContent: {
    width: '100%',
  },
  annotationsOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 320,
    paddingTop: 60,
    paddingBottom: 96,
    paddingRight: 16,
    justifyContent: 'flex-start',
  },
  annotationsPanel: {
    flex: 1,
    backgroundColor: '#111111',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222222',
  },
  annotationsSubtitle: {
    color: '#888888',
    fontSize: 12,
    marginTop: 2,
  },
  annotationsList: {
    flex: 1,
  },
  highlightsSection: {
    marginTop: 12,
    gap: 8,
  },
  highlightsTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  highlightItem: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 8,
  },
  highlightItemTextWrap: {
    flex: 1,
  },
  highlightItemText: {
    color: '#FFEB3B',
    fontSize: 12,
    flex: 1,
  },
  highlightSearchButton: {
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#333333',
    alignSelf: 'flex-start',
  },
  highlightSearchButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  annotationNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  annotationArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1C',
  },
  annotationArrowText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  annotationCount: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  pageSlider: {
    marginTop: 12,
  },
  pageSliderLabel: {
    color: '#CCCCCC',
    fontSize: 12,
    marginBottom: 6,
  },
  annotationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  annotationsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addAnnotationButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  addAnnotationText: {
    color: '#111111',
    fontSize: 18,
    fontWeight: '700',
  },
  annotationInputRow: {
    marginBottom: 12,
    gap: 8,
  },
  annotationInput: {
    minHeight: 72,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    backgroundColor: '#0E0E0E',
    color: '#FFFFFF',
    padding: 10,
    fontSize: 13,
  },
  annotationInputActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  annotationSaveButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  annotationSaveText: {
    color: '#111111',
    fontSize: 13,
    fontWeight: '600',
  },
  annotationCancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  annotationCancelText: {
    color: '#CCCCCC',
    fontSize: 13,
    fontWeight: '600',
  },
  annotationCard: {
    backgroundColor: '#1C1C1C',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  annotationText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
  },
  annotationsEmpty: {
    color: '#999999',
    fontSize: 13,
  },
  pageControls: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  pageButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#1A1A1A',
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  pageIndicator: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
  longPressHint: {
    color: '#888888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
  body: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
    fontFamily: 'CormorantGaramond',
    textAlign: 'center',
  },
  highlightText: {
    backgroundColor: '#FFEB3B',
    color: '#111111',
  },
  error: {
    marginTop: 12,
    fontSize: 14,
    color: '#FF6B6B',
    textAlign: 'center',
  },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#222222',
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  highlightOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  highlightCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222222',
  },
  highlightTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  highlightInput: {
    minHeight: 96,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    backgroundColor: '#0E0E0E',
    color: '#FFFFFF',
    padding: 10,
    fontSize: 13,
    marginBottom: 10,
  },
  actionText: {
    color: '#111111',
    fontSize: 14,
    fontWeight: '600',
  },
  popupActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  popupButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  popupButtonText: {
    color: '#111111',
    fontSize: 14,
    fontWeight: '600',
  },
  popupCancelButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  popupCancelText: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  swipeZone: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 28,
    zIndex: 100,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 950,
  },
  loadingText: {
    color: '#CCCCCC',
    fontSize: 13,
    marginTop: 8,
  },
  fetchedNotesSection: {
    marginTop: 12,
    gap: 8,
  },
  fetchedNotesTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  fetchedNoteCard: {
    backgroundColor: '#1C1C1C',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  fetchedNoteText: {
    color: '#FFEB3B',
    fontSize: 13,
    fontWeight: '500',
  },
  noteContent: {
    color: '#CCCCCC',
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16,
  },
});
