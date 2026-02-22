import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { Fonts } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { auth } from '@/services/firebaseConfig';
import { logOut } from '@/services/authService';

import { Link, router } from 'expo-router';


export default function HomeScreen() {
  const [displayName, setDisplayName] = useState<string>('User');
  const [email, setEmail] = useState<string>('');

  // Refresh user data on mount to get latest displayName
  useEffect(() => {
    const refreshUser = async () => {
      const user = auth.currentUser;
      if (user) {
        // Reload user to get latest profile data (including displayName set during signup)
        await user.reload();
        
        // Get the refreshed user
        const refreshedUser = auth.currentUser;
        setDisplayName(refreshedUser?.displayName || 'User');
        setEmail(refreshedUser?.email || '');
      }
    };
    refreshUser();
  }, []);

  // Sample data - will be replaced with actual user data
  const currentReads = [
    { id: 1, title: 'Book 1' },
    { id: 2, title: 'Book 2' },
    { id: 3, title: 'Book 3' },
    { id: 4, title: 'Book 4' },
  ];

  const handleLogout = async () => {
    await logOut();
    // Navigation happens automatically via auth state listener in _layout.tsx
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Greeting */}
        <View style={styles.header}>
          <Text style={styles.greeting}>HELLO {displayName.toUpperCase()}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        {/* Current Reads Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your current reads</Text>
          
          {/* Book Grid */}
          <View style={styles.bookGrid}>
            {currentReads.map((book) => (
              <Pressable 
                key={book.id} 
                style={styles.bookCard}
                onPress={() => {
                  // TODO: Navigate to book reader
                  console.log('Open book:', book.title);
                }}
              >
                <View style={styles.bookPlaceholder}>
                  <Text style={styles.bookPlaceholderText}>{book.title}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </Pressable>
        </View>

        <View>
          {/* Dev Button - Temporary */}
          <Pressable 
            style={styles.devButton}
            onPress={() => router.push('/reader')}
          >
            <Text style={styles.devButtonText}>Dev (Skip to reader)</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Pressable 
          style={styles.navItem}
          onPress={() => {
            // TODO: Navigate to home (already here)
            console.log('Home');
          }}
        >
          <IconSymbol name="house.fill" size={24} color="#11181C" />
        </Pressable>
        
        <Pressable 
          style={styles.navItem}
          onPress={() => {
            // TODO: Navigate to favorites
            console.log('Favorites');
          }}
        >
          <IconSymbol name="heart.fill" size={24} color="#11181C" />
        </Pressable>
        
        <Pressable 
          style={styles.navItem}
          onPress={() => {
            // TODO: Navigate to add/create
            console.log('Add');
          }}
        >
          <IconSymbol name="plus.circle.fill" size={24} color="#11181C" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 100, // Space for bottom nav
  },
  header: {
    marginBottom: 32,
  },
  greeting: {
    fontSize: 32,
    fontFamily: Fonts.serif,
    fontWeight: 'bold',
    color: '#11181C',
    letterSpacing: 1,
  },
  email: {
    fontSize: 14,
    fontFamily: Fonts.sans,
    color: '#666666',
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: Fonts.serif,
    fontWeight: '400',
    color: '#11181C',
    marginBottom: 20,
  },
  bookGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  bookCard: {
    width: '47%', // 2 columns with gap
    aspectRatio: 0.7, // Book-like aspect ratio
  },
  bookPlaceholder: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  bookPlaceholderText: {
    fontSize: 14,
    fontFamily: Fonts.sans,
    color: '#666666',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.sans,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navItem: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
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