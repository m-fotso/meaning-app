import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { saveNote } from '@/services/notesService';

interface ChapterNoteProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  bookId: string;
  currentPage: number;
  onSaveSuccess?: () => void;
}

export const ChapterNote: React.FC<ChapterNoteProps> = ({
  visible,
  onClose,
  userId,
  bookId,
  currentPage,
  onSaveSuccess,
}) => {
  const [chapterNote, setChapterNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveNote = async () => {
    const trimmed = chapterNote.trim();
    if (!trimmed) {
      setError('Please enter a note');
      return;
    }

    setIsSaving(true);
    setError(null);

    const result = await saveNote(userId, {
      bookId,
      pageNumber: currentPage,
      //check how parsing for chapter/chapter identification works
      highlightedText: `Chapter/Page ${currentPage + 1} Summary`,
      userNote: trimmed,
    });

    if (result.success) {
      setChapterNote('');
      onSaveSuccess?.();
      onClose();
    } else {
      setError(`Failed to save: ${result.error}`);
    }

    setIsSaving(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Chapter Check-in! What are you thinking?</Text>
            {/* ai generated questions would go here */}
            <Text style={styles.subtitle}>
              Page {currentPage + 1} — Type your thoughts below!
            </Text>

            <TextInput
              value={chapterNote}
              onChangeText={setChapterNote}
              
              placeholder="Write your chapter summary or key points..."
              placeholderTextColor="#777777"
              style={styles.input}
              multiline
              editable={!isSaving}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.actions}>
              <Pressable
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveNote}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#111111" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Note</Text>
                )}
              </Pressable>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={isSaving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#222222',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#CCCCCC',
    marginBottom: 16,
  },
  input: {
    minHeight: 120,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    backgroundColor: '#0E0E0E',
    color: '#FFFFFF',
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#FFFFFF',
  },
  saveButtonText: {
    color: '#111111',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  cancelButtonText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '600',
  },
});