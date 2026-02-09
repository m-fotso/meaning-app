
import React, { useState } from 'react';
import { StyleSheet, View, Pressable, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function AddBookScreen() {
	const [pdf, setPdf] = useState<any>(null);

	const pickPdf = async () => {
		try {
			const res = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
			if (res.type === 'success') {
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

		// Placeholder: integrate real upload here.
		Alert.alert('Selected PDF', `${pdf.name}\n${pdf.size ? `${pdf.size} bytes` : ''}`);
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

				<Pressable style={[styles.uploadButton, !pdf && styles.disabled]} onPress={handleUpload} disabled={!pdf}>
					<ThemedText type="defaultSemiBold" style={styles.uploadButtonText}>
						Upload
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

