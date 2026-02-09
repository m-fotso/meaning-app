import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  // Sample data - will be replaced with actual user data
  const userName = 'GINA';
  const currentReads = [
    { id: 1, title: 'Book 1' },
    { id: 2, title: 'Book 2' },
    { id: 3, title: 'Book 3' },
    { id: 4, title: 'Book 4' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Greeting */}
        <View style={styles.header}>
          <Text style={styles.greeting}>HELLO {userName}</Text>
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
});
