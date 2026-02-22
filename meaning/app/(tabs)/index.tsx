// app/(tabs)/index.tsx
import { StyleSheet, Button } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { logOut } from '@/services/authService';
import { auth } from '@/services/firebaseConfig';

export default function HomeScreen() {
  const handleLogout = async () => {
    await logOut();
    // Navigation happens automatically via auth state listener
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Welcome!</ThemedText>
      <ThemedText style={styles.email}>
        Logged in as: {auth.currentUser?.email}
      </ThemedText>
      <Button title="Logout" onPress={handleLogout} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  email: {
    marginVertical: 20,
  },
});