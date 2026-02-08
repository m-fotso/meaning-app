# Screens Guide - Meaning App

## Overview
This document describes the screens that have been set up for the Meaning app frontend.

## Screen Structure

### 1. Landing/Welcome Screen (`app/index.tsx`)
- **Route**: `/` (root)
- **Features**:
  - App title "Meaning" in serif font
  - Tagline "where words come alive"
  - "Get Started" button → navigates to sign-up
  - "Sign In" button → navigates to sign-in
  - "Dev (Skip to Home)" button → temporary bypass to home screen

### 2. Sign In Screen (`app/signin.tsx`)
- **Route**: `/signin`
- **Features**:
  - App title "Meaning"
  - Email input field
  - Password input field
  - "Sign In" button (functionality TODO)
  - "Forgot password?" link
  - "Not Registered? Sign up" button → navigates to sign-up

### 3. Sign Up Screen (`app/signup.tsx`)
- **Route**: `/signup`
- **Features**:
  - App title "Meaning"
  - Dark-themed form container
  - Email input field
  - Password input field
  - Checkbox for terms/agreement
  - "Register" button (functionality TODO)
  - "Already have an account? Sign in" button → navigates to sign-in

### 4. Home Screen (`app/home.tsx`)
- **Route**: `/home`
- **Features**:
  - Personalized greeting ("HELLO [USERNAME]")
  - "Your current reads" section
  - 2x2 grid of book placeholders (4 sample books)
  - Bottom navigation bar with:
    - Home icon
    - Favorites icon (heart)
    - Add icon (plus)

## Navigation Flow

```
Landing Page (/)
  ├─→ Get Started → Sign Up (/signup)
  ├─→ Sign In → Sign In (/signin)
  └─→ Dev Button → Home (/home)

Sign Up (/signup)
  └─→ "Already have an account?" → Sign In (/signin)

Sign In (/signin)
  └─→ "Not Registered?" → Sign Up (/signup)

Home (/home)
  └─→ (Bottom nav - functionality TODO)
```

## TODO Items for Backend Integration

1. **Sign In Screen**:
   - Connect form to authentication API
   - Handle authentication errors
   - Navigate to home on successful login
   - Store user session/token

2. **Sign Up Screen**:
   - Connect form to registration API
   - Validate email/password
   - Handle registration errors
   - Navigate to home on successful registration

3. **Home Screen**:
   - Fetch actual user data (replace "GINA" with real username)
   - Fetch actual user's books/PDFs
   - Implement book card click → open book reader
   - Implement bottom navigation functionality

## Styling Notes

- Uses serif fonts for titles (elegant, book-like feel)
- Uses sans-serif fonts for buttons and inputs
- Color scheme: Black (#000000) for primary buttons, white backgrounds
- Sign-up form uses dark grey container (#2C2C2C) for contrast
- Book cards have subtle shadows for depth

## Testing

To test the screens:
1. Run `npm start` in the `meaning` directory
2. Open app in Expo Go on your phone
3. Navigate through:
   - Landing page → Click buttons to test navigation
   - Sign in/Sign up → Test form inputs (no backend yet)
   - Dev button → See home screen layout

## Next Steps for Team

- **Backend Team**: Implement authentication endpoints
- **PDF Team**: Implement book reader screen
- **UI Team**: Refine styling, add animations, improve responsiveness
