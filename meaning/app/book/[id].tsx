import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

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

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
      <Text style={styles.title}>{displayTitle}</Text>
      {loading ? (
        <Text style={styles.subtitle}>
          Loading PDF... {(elapsedMs / 1000).toFixed(1)}s
        </Text>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!loading && !error && pages.length ? (
        <View style={styles.pageList}>
          <Text style={styles.body}>{pages[currentPage]}</Text>
          <View style={styles.pageControls}>
            <Pressable
              style={[styles.pageButton, currentPage === 0 && styles.pageButtonDisabled]}
              onPress={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              <Text style={styles.pageButtonText}>Previous</Text>
            </Pressable>
            <Text style={styles.pageIndicator}>
              Page {currentPage + 1} of {pages.length}
            </Text>
            <Pressable
              style={[
                styles.pageButton,
                currentPage === pages.length - 1 && styles.pageButtonDisabled,
              ]}
              onPress={() =>
                setCurrentPage((prev) => Math.min(pages.length - 1, prev + 1))
              }
              disabled={currentPage === pages.length - 1}
            >
              <Text style={styles.pageButtonText}>Next</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        !loading &&
        !error && <Text style={styles.subtitle}>Book detail page</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flexGrow: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
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
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  pageList: {
    width: '100%',
    paddingTop: 8,
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
  },
  body: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
    fontFamily: 'CormorantGaramond',
    textAlign: 'center',
  },
  error: {
    marginTop: 12,
    fontSize: 14,
    color: '#FF6B6B',
    textAlign: 'center',
  },
});
