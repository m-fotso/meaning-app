import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import Slider from '@react-native-community/slider';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function BookDetailScreen() {
  const router = useRouter();
  const { title, id, pdfPath } = useLocalSearchParams<{
    title?: string;
    id?: string;
    pdfPath?: string;
  }>();
  const displayTitle = title ?? `Book ${id ?? ''}`;
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [annotationsByPage, setAnnotationsByPage] = useState<Record<number, string[]>>({});
  const [newAnnotation, setNewAnnotation] = useState('');
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const currentAnnotations = annotationsByPage[currentPage] ?? [];

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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load PDF text.');
      } finally {
        setLoading(false);
        setStartTime(null);
      }
    };

    fetchText();
  }, [pdfPath]);

  useEffect(() => {
    if (!loading || startTime === null) {
      return;
    }
    const intervalId = setInterval(() => {
      setElapsedMs(Date.now() - startTime);
    }, 200);
    return () => clearInterval(intervalId);
  }, [loading, startTime]);

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

  const renderText = (text: string) => {
    return <Text style={styles.body}>{text}</Text>;
  };

  return (
    <View style={styles.screen}>
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
          </View>
      ) : (
        !loading &&
        !error && <Text style={styles.subtitle}>Book detail page</Text>
      )}
      </ScrollView>
      {showAnnotations ? (
        <View style={styles.annotationsOverlay}>
          <View style={styles.annotationsPanel}>
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
            </ScrollView>
            <View style={styles.pageSlider}>
              <Text style={styles.pageSliderLabel}>Jump to page {currentPage + 1}</Text>
              <Slider
                minimumValue={0}
                maximumValue={Math.max(0, pages.length - 1)}
                step={1}
                value={currentPage}
                onValueChange={(value) => setCurrentPage(Math.round(value))}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#333333"
                thumbTintColor="#FFFFFF"
              />
            </View>
          </View>
        </View>
      ) : null}
      <View style={styles.actionBar}>
        <Pressable
          style={[styles.actionButton, currentPage === 0 && styles.actionButtonDisabled]}
          onPress={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
          disabled={currentPage === 0}
        >
          <Text style={styles.actionText}>Prev</Text>
        </Pressable>
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
  highlightItemText: {
    color: '#FFEB3B',
    fontSize: 12,
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
});
