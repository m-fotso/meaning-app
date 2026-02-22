import { StyleSheet, View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { Link } from 'expo-router';
import { Fonts } from '@/constants/theme';
import { useState } from 'react';
import { signIn } from '@/services/authService';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Sign In Failed', result.error);
    }
    // Navigation happens automatically via auth state listener in _layout.tsx
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* App Title */}
      <Text style={styles.title}>Meaning</Text>

      {/* Form Container */}
      <View style={styles.formContainer}>
        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
          />
        </View>

        {/* Sign In Button */}
        <Pressable 
          style={[styles.signInButton, loading && styles.buttonDisabled]} 
          onPress={handleSignIn}
          disabled={loading}
        >
          <Text style={styles.signInButtonText}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Text>
        </Pressable>

        {/* Forgot Password Link */}
        <Pressable style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </Pressable>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomContainer}>
        <Link href="/signup" asChild>
          <Pressable style={styles.bottomButton}>
            <Text style={styles.bottomButtonText}>Not Registered? Sign up</Text>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 48,
    fontFamily: Fonts.serif,
    fontWeight: '400',
    color: '#11181C',
    textAlign: 'center',
    marginBottom: 40,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#11181C',
    fontFamily: Fonts.sans,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: Fonts.sans,
    color: '#11181C',
    backgroundColor: '#FFFFFF',
  },
  signInButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#666666',
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.sans,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#0a7ea4',
    fontFamily: Fonts.sans,
  },
  bottomContainer: {
    paddingTop: 20,
  },
  bottomButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  bottomButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.sans,
  },
});