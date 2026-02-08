# Development Guide for Meaning App

## What is Expo?

Expo is a framework and platform for building React Native apps. It simplifies mobile development by:
- **No need for Xcode/Android Studio setup** (initially) - you can test on your phone using Expo Go
- **File-based routing** - your app structure mirrors your file structure
- **Hot reloading** - see changes instantly as you code
- **Cross-platform** - write once, run on iOS, Android, and Web

## Project Setup

### Prerequisites
1. **Node.js** (v18 or later recommended) - [Download here](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. **Expo Go app** on your phone (iOS: App Store, Android: Play Store) - for testing on real device

### Initial Setup Steps

1. **Navigate to the project directory:**
   ```bash
   cd meaning
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   This installs all the packages your app needs (React, Expo, etc.)

3. **Start the development server:**
   ```bash
   npm start
   ```
   or
   ```bash
   npx expo start
   ```

   This will:
   - Start a development server
   - Show a QR code in your terminal
   - Open a web interface (usually at http://localhost:8081)

## Running/Testing Your App

### Option 1: On Your Phone (Easiest for Beginners)

1. Install **Expo Go** app on your phone:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Start the dev server (`npm start`)

3. Scan the QR code:
   - **iOS**: Open Camera app → scan QR code → opens in Expo Go
   - **Android**: Open Expo Go app → tap "Scan QR code"

4. Your app will load on your phone! Changes you make will reload automatically.

### Option 2: iOS Simulator (Mac only)

```bash
npm run ios
```

Requires:
- Mac computer
- Xcode installed (from App Store)
- iOS Simulator

### Option 3: Android Emulator

```bash
npm run android
```

Requires:
- Android Studio installed
- Android emulator set up

### Option 4: Web Browser

```bash
npm run web
```

Opens your app in a web browser - great for quick testing, but some mobile features won't work.

## Project Structure

```
meaning/
├── app/                    # Your app screens (file-based routing)
│   ├── _layout.tsx        # Root layout (wraps entire app)
│   ├── (tabs)/            # Tab navigation group
│   │   ├── _layout.tsx    # Tab bar configuration
│   │   ├── index.tsx      # Home screen (first tab)
│   │   └── explore.tsx    # Explore screen (second tab)
│   └── modal.tsx          # Modal screen
├── components/            # Reusable UI components
│   ├── themed-text.tsx    # Text component with dark/light mode
│   ├── themed-view.tsx    # View component with dark/light mode
│   └── ui/               # UI components
├── constants/            # Constants (colors, themes, etc.)
├── hooks/                # Custom React hooks
├── assets/               # Images, fonts, etc.
├── app.json             # Expo configuration
└── package.json         # Dependencies and scripts
```

## How File-Based Routing Works

In Expo Router, your file structure = your app's navigation:

- `app/index.tsx` → `/` (root route)
- `app/(tabs)/index.tsx` → Home tab
- `app/(tabs)/explore.tsx` → Explore tab
- `app/modal.tsx` → `/modal` route

**Parentheses `()`** create route groups (don't appear in URL):
- `(tabs)` is a group containing the tab screens

## Developing Features

### Adding a New Screen

1. **Create a new file** in the `app` directory:
   ```typescript
   // app/profile.tsx
   import { ThemedText } from '@/components/themed-text';
   import { ThemedView } from '@/components/themed-view';
   
   export default function ProfileScreen() {
     return (
       <ThemedView>
         <ThemedText>Profile Screen</ThemedText>
       </ThemedView>
     );
   }
   ```

2. **Navigate to it** using:
   ```typescript
   import { Link } from 'expo-router';
   
   <Link href="/profile">Go to Profile</Link>
   ```

### Adding a New Tab

1. **Create a file** in `app/(tabs)/`:
   ```typescript
   // app/(tabs)/profile.tsx
   export default function ProfileTab() {
     return <ThemedView>...</ThemedView>;
   }
   ```

2. **Add it to the tab bar** in `app/(tabs)/_layout.tsx`:
   ```typescript
   <Tabs.Screen
     name="profile"
     options={{
       title: 'Profile',
       tabBarIcon: ({ color }) => <IconSymbol name="person.fill" color={color} />,
     }}
   />
   ```

### Creating Reusable Components

1. **Create a component** in `components/`:
   ```typescript
   // components/my-button.tsx
   import { Pressable, Text } from 'react-native';
   
   export function MyButton({ title, onPress }) {
     return (
       <Pressable onPress={onPress}>
         <Text>{title}</Text>
       </Pressable>
     );
   }
   ```

2. **Use it** in your screens:
   ```typescript
   import { MyButton } from '@/components/my-button';
   ```

### Styling

Expo uses **React Native StyleSheet** (similar to CSS but different):

```typescript
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

// Use it:
<View style={styles.container}>
  <Text style={styles.text}>Hello</Text>
</View>
```

**Key differences from CSS:**
- Use `flex` instead of `display: flex`
- No `px` units - just numbers (pixels)
- Use `backgroundColor` not `background-color`
- Use camelCase for all properties

## Key React Native Components

Instead of HTML elements, React Native uses:

- `<View>` → `<div>` (container)
- `<Text>` → `<p>`, `<span>` (text - **required** for any text!)
- `<Image>` → `<img>` (use `expo-image`'s `Image` component)
- `<Pressable>` or `<TouchableOpacity>` → `<button>`
- `<ScrollView>` → scrollable container
- `<TextInput>` → `<input type="text">`

**Important:** All text must be inside `<Text>` components!

## Common Development Workflow

1. **Start dev server:**
   ```bash
   cd meaning
   npm start
   ```

2. **Open app on phone** (scan QR code with Expo Go)

3. **Edit files** in `app/` or `components/`

4. **See changes instantly** - Expo hot reloads automatically

5. **Check for errors:**
   - Terminal shows build errors
   - Phone shows runtime errors
   - Press `r` in terminal to reload manually

## Useful Commands

```bash
# Start dev server
npm start

# Start for specific platform
npm run ios        # iOS simulator (Mac only)
npm run android    # Android emulator
npm run web        # Web browser

# Lint your code (check for errors)
npm run lint
```

## Debugging

### View Logs
- Check your terminal where `npm start` is running
- Errors appear in red

### Developer Menu
- **iOS Simulator**: `Cmd + D` or `Cmd + Ctrl + Z`
- **Android Emulator**: `Cmd + M` or shake device
- **Expo Go on phone**: Shake device

From developer menu you can:
- Reload app
- Enable fast refresh
- View element inspector
- Show performance monitor

### Common Issues

1. **"Module not found"** → Run `npm install`
2. **App won't load** → Check terminal for errors
3. **Changes not showing** → Press `r` in terminal to reload
4. **Can't scan QR code** → Make sure phone and computer are on same WiFi

## Key Concepts to Learn

1. **React Native Basics**: Components, props, state, hooks
2. **Expo Router**: File-based routing, navigation
3. **React Native Components**: View, Text, Image, ScrollView, etc.
4. **Styling**: StyleSheet, Flexbox layout
5. **Platform-specific code**: Use `Platform.select()` for iOS/Android differences

## Resources

- **Expo Docs**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/docs/getting-started
- **Expo Router Docs**: https://docs.expo.dev/router/introduction/
- **React Native Components**: https://reactnative.dev/docs/components-and-apis

## Tips for Your Capstone Project

1. **Start simple** - Get one feature working end-to-end
2. **Test frequently** - Use Expo Go on your phone often
3. **Use TypeScript** - Your project already has it set up, use it!
4. **Component organization** - Keep reusable UI in `components/`
5. **Git workflow** - Commit often, especially when features work
6. **Ask for help** - Expo Discord: https://chat.expo.dev

## Next Steps

1. ✅ Run `npm install` in the `meaning` directory
2. ✅ Run `npm start` and test on your phone
3. ✅ Edit `app/(tabs)/index.tsx` to see changes
4. ✅ Explore the existing components in `components/`
5. ✅ Read the Expo Router docs for navigation patterns

Happy coding! 🚀
