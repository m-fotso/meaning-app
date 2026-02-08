import { StyleSheet, View, Pressable, Text } from 'react-native';
import { Link, router } from 'expo-router';
import { Fonts } from '@/constants/theme';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* App Title */}
        <Text style={styles.title}>Meaning</Text>
        
        {/* Tagline */}
        <Text style={styles.tagline}>
          where words come <Text style={styles.taglineBold}>alive</Text>
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        {/* Get Started Button */}
        <Link href="/signup" asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </Pressable>
        </Link>

        {/* Sign In Button */}
        <Link href="/signin" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Sign In</Text>
          </Pressable>
        </Link>

        {/* Dev Button - Temporary */}
        <Pressable 
          style={styles.devButton}
          onPress={() => router.push('/home')}
        >
          <Text style={styles.devButtonText}>Dev (Skip to Home)</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontFamily: Fonts.serif,
    fontWeight: '400',
    color: '#11181C',
    marginBottom: 16,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 20,
    fontFamily: Fonts.serif,
    fontWeight: '300',
    color: '#11181C',
    textAlign: 'center',
  },
  taglineBold: {
    fontWeight: '600',
    color: '#8B6914', // Light brown/gold color
  },
  buttonContainer: {
    width: '100%',
    paddingBottom: 40,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.sans,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D0D0D0',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  secondaryButtonText: {
    color: '#11181C',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.sans,
  },
  devButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  devButtonText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: Fonts.sans,
  },
});
