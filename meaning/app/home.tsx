import { useState, useEffect } from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { auth } from '@/services/firebaseConfig';
import { logOut } from '@/services/authService';
import { getUserBooks, type Book } from '@/services/bookService';

import { Link, router } from 'expo-router';


export default function HomeScreen() {
  const [displayName, setDisplayName] = useState<string>('User');
  const [email, setEmail] = useState<string>('');
  const [currentReads, setCurrentReads] = useState<Array<{ id: string; title: string; pdfPath: string | null }>>([]);

  const hardcodedBooks = [
    { id: 'hc-1', title: 'Book 1', pdfPath: 'deliverable-marie/alice-in-wonderland.pdf' },
    {
      id: 'hc-2',
      title: 'Book 2',
      pdfPath:
        'deliverable-marie/Terry Pratchett - Night Watch (Discworld, #29) (2003).pdf',
    },
    { id: 'hc-3', title: 'Book 3', pdfPath: null },
    { id: 'hc-4', title: 'Book 4', pdfPath: null },
  ];

  // Refresh user data and fetch books on mount
  useEffect(() => {
    const refreshUser = async () => {
      const user = auth.currentUser;
      if (user) {
        await user.reload();
        const refreshedUser = auth.currentUser;
        setDisplayName(refreshedUser?.displayName || 'User');
        setEmail(refreshedUser?.email || '');

        // Fetch user's books from Firestore
        const result = await getUserBooks(user.uid);
        if (result.success && result.books && result.books.length > 0) {
          setCurrentReads(
            result.books.map((b) => ({
              id: b.id,
              title: b.title,
              pdfPath: b.pdfPath || null,
            }))
          );
        } else {
          // Fall back to hardcoded list
          setCurrentReads(hardcodedBooks);
        }
      } else {
        setCurrentReads(hardcodedBooks);
      }
    };
    refreshUser();
  }, []);

  const router = useRouter();

  const handleLogout = async () => {
    await logOut();
    // Navigation happens automatically via auth state listener in _layout.tsx
  };
  const bookCover = require('../deliverable-marie/Screenshot 2026-02-08 at 9.28.27 PM.png');

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
                  router.push({
                    pathname: '/book/[id]' as any,
                    params: {
                      id: String(book.id),
                      title: book.title,
                      pdfPath: book.pdfPath ?? '',
                    },
                  });
                }}
              >
                <View style={styles.bookPlaceholder}>
                  <Image source={bookCover} style={styles.bookImage} resizeMode="cover" />
                  <View style={styles.bookTitleContainer}>
                    <Text style={styles.bookPlaceholderText}>{book.title}</Text>
                  </View>
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
            // TODO: Navigate to Add Book screen
            console.log('Add');
            router.push('/add-book');
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
    overflow: 'hidden',
  },
  bookImage: {
    flex: 1,
    width: '100%',
  },
  bookTitleContainer: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
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