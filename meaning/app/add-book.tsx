
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { addBook } from '@/services/bookService';
import { auth } from '@/services/firebaseConfig';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

export default function AddBookScreen() {
	const router = useRouter();
	const [pdf, setPdf] = useState<any>(null);
	const [uploading, setUploading] = useState(false);

	const pickPdf = async () => {
		try {
			const res = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
			if (res.canceled === false) {
				setPdf(res);
			}
		} catch (err) {
			console.error('Document pick error', err);
			Alert.alert('Error', 'Could not pick the document.');
		}
	};

	const handleUpload = async () => {
		if (!pdf) {
			Alert.alert('No file', 'Please choose a PDF first.');
			return;
		}

		const userId = auth.currentUser?.uid;
		if (!userId) {
			Alert.alert('Error', 'You must be signed in to add a book.');
			return;
		}

		setUploading(true);
		try {
			const asset = pdf.assets?.[0] ?? pdf;
			const title = asset.name?.replace(/\.pdf$/i, '') ?? 'Untitled';
			const pdfPath = asset.uri ?? '';

			const result = await addBook(userId, { title, pdfPath });
			if (result.success) {
				Alert.alert('Success', `"${title}" added to your library.`);
				router.back();
			} else {
				Alert.alert('Error', result.error ?? 'Failed to add book.');
			}
		} catch (err: any) {
			Alert.alert('Error', err.message ?? 'Failed to add book.');
		} finally {
			setUploading(false);
		}
	};

	return (
		<ThemedView style={styles.container}>
			<View style={styles.content}>
				<ThemedText type="title" style={styles.title}>
					Add a book
				</ThemedText>

				<Pressable style={styles.pickButton} onPress={pickPdf}>
					<ThemedText type="defaultSemiBold" style={styles.pickButtonText}>
						Choose PDF
					</ThemedText>
				</Pressable>

				{pdf ? (
					<View style={styles.fileInfo}>
						<ThemedText type="defaultSemiBold">Selected file:</ThemedText>
						<ThemedText style={styles.fileName}>{pdf.name}</ThemedText>
						{pdf.size ? <ThemedText style={styles.fileSize}>{pdf.size} bytes</ThemedText> : null}
					</View>
				) : (
					<ThemedText style={styles.hint}>No PDF chosen yet.</ThemedText>
				)}

				<Pressable style={[styles.uploadButton, (!pdf || uploading) && styles.disabled]} onPress={handleUpload} disabled={!pdf || uploading}>
					<ThemedText type="defaultSemiBold" style={styles.uploadButtonText}>
						{uploading ? 'Adding...' : 'Add Book'}
					</ThemedText>
				</Pressable>
			</View>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		paddingHorizontal: 24,
		paddingTop: 60,
	},
	title: {
		marginBottom: 24,
	},
	pickButton: {
		backgroundColor: '#F0F7FB',
		paddingVertical: 14,
		paddingHorizontal: 16,
		borderRadius: 8,
		alignItems: 'center',
		marginBottom: 16,
	},
	pickButtonText: {
		color: '#0a7ea4',
	},
	fileInfo: {
		marginBottom: 20,
	},
	fileName: {
		marginTop: 8,
	},
	fileSize: {
		marginTop: 4,
		color: '#666',
	},
	hint: {
		marginBottom: 20,
		color: '#666',
	},
	uploadButton: {
		backgroundColor: '#0a7ea4',
		paddingVertical: 14,
		paddingHorizontal: 16,
		borderRadius: 8,
		alignItems: 'center',
	},
	uploadButtonText: {
		color: '#fff',
	},
	disabled: {
		opacity: 0.5,
	},
});

