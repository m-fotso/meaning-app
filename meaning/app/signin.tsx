import { StyleSheet, View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { Fonts } from '@/constants/theme';
import { useState } from 'react';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    // TODO: Implement sign-in functionality
    console.log('Sign in:', { email, password });
    // For now, just navigate to home (will be replaced with actual auth)
    // router.push('/home');
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
            placeholder="Value"
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
            placeholder="Value"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
          />
        </View>

        {/* Sign In Button */}
        <Pressable style={styles.signInButton} onPress={handleSignIn}>
          <Text style={styles.signInButtonText}>Sign In</Text>
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
