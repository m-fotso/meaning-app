import { StyleSheet, View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { Fonts } from '@/constants/theme';
import { useState } from 'react';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleRegister = () => {
    // TODO: Implement registration functionality
    console.log('Register:', { email, password, agreed });
    // For now, just log (will be replaced with actual auth)
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

        {/* Checkbox */}
        <View style={styles.checkboxContainer}>
          <Pressable 
            style={styles.checkbox}
            onPress={() => setAgreed(!agreed)}
          >
            {agreed && <View style={styles.checkboxInner} />}
          </Pressable>
          <Text style={styles.checkboxLabel}>Label Description</Text>
        </View>

        {/* Register Button */}
        <Pressable style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Register</Text>
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
  },
  registerButton: {
    backgroundColor: '#D0D0D0', // Light grey
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
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
