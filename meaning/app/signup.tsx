import { StyleSheet, View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { Link } from 'expo-router';
import { Fonts } from '@/constants/theme';
import { useState } from 'react';
import { signUp } from '@/services/authService';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !displayName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!agreed) {
      Alert.alert('Error', 'Please agree to the terms and conditions');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await signUp(email, password, displayName);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Registration Failed', result.error);
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

      {/* Form Container - Dark Theme */}
      <View style={styles.formContainer}>
        {/* Display Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor="#999"
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
          />
        </View>

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
            placeholder="Enter your password (min 6 chars)"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
          />
        </View>

        {/* Checkbox */}
        <View style={styles.checkboxContainer}>
          <Pressable 
            style={styles.checkbox}
            onPress={() => setAgreed(!agreed)}
          >
            {agreed && <View style={styles.checkboxInner} />}
          </Pressable>
          <Text style={styles.checkboxLabel}>I agree to the Terms and Conditions</Text>
        </View>

        {/* Register Button */}
        <Pressable 
          style={[styles.registerButton, loading && styles.buttonDisabled]} 
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.registerButtonText}>
            {loading ? 'Creating Account...' : 'Register'}
          </Text>
        </Pressable>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomContainer}>
        <Link href="/signin" asChild>
          <Pressable style={styles.bottomButton}>
            <Text style={styles.bottomButtonText}>Already have an account? Sign in</Text>
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
    backgroundColor: '#2C2C2C', // Dark grey container
    borderRadius: 12,
    padding: 24,
    gap: 24,
    marginBottom: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: Fonts.sans,
  },
  input: {
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: Fonts.sans,
    color: '#FFFFFF',
    backgroundColor: '#2C2C2C',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 14,
    height: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: Fonts.sans,
    flex: 1,
  },
  registerButton: {
    backgroundColor: '#D0D0D0', // Light grey
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#888888',
  },
  registerButtonText: {
    color: '#11181C',
    fontSize: 16,
    fontWeight: '600',
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