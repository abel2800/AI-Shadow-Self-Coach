# Mobile App Setup Guide
## React Native Project Structure

**Status:** Initial Structure Created ✅

---

## 📁 Project Structure Created

```
mobile/
├── src/
│   ├── screens/
│   │   └── Onboarding/
│   │       └── WelcomeScreen.js ✅
│   ├── navigation/
│   │   └── AppNavigator.js ✅
│   ├── services/
│   │   └── api.js ✅
│   ├── store/
│   │   ├── store.js ✅
│   │   └── slices/
│   │       └── auth.slice.js ✅
│   └── theme/
│       ├── colors.js ✅
│       └── typography.js ✅
├── package.json ✅
├── .env.example ✅
└── README.md ✅
```

---

## ✅ Files Created

1. **package.json** - Dependencies and scripts
2. **src/App.js** - Main app component
3. **src/navigation/AppNavigator.js** - Navigation setup
4. **src/services/api.js** - API service layer
5. **src/store/store.js** - Redux store configuration
6. **src/store/slices/auth.slice.js** - Auth state management
7. **src/theme/colors.js** - Color palette
8. **src/theme/typography.js** - Typography system
9. **src/screens/Onboarding/WelcomeScreen.js** - Welcome screen

---

## 🚀 Next Steps

### 1. Initialize React Native Project

```bash
cd mobile
npx react-native init ShadowCoach --template react-native-template-typescript
# Or use existing structure
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install iOS Dependencies (Mac only)

```bash
cd ios
pod install
cd ..
```

### 4. Create Remaining Screens

- [ ] PrivacyScreen.js
- [ ] MoodBaselineScreen.js
- [ ] PreferencesScreen.js
- [ ] HomeScreen.js
- [ ] SessionScreen.js
- [ ] JournalScreen.js
- [ ] AnalyticsScreen.js
- [ ] ResourcesScreen.js

### 5. Create Components

- [ ] ChatBubble.js
- [ ] ChatInput.js
- [ ] MoodSlider.js
- [ ] SessionCard.js
- [ ] EmergencyModal.js

### 6. Create Store Slices

- [ ] session.slice.js
- [ ] journal.slice.js

---

## 📝 Configuration

### Environment Variables

Create `.env` file:
```
API_BASE_URL=http://localhost:3000/api/v1
```

### API Integration

The app is configured to connect to:
- **Development:** `http://localhost:3000/api/v1`
- Update in `.env` for production

---

## 🎨 Design System

### Colors
- Primary: `#6B9BD2` (Soft Blue)
- Secondary: `#7FB3A3` (Sage Green)
- Accent: `#B8A9D9` (Lavender)

### Typography
- H1: 28pt, Bold
- H2: 24pt, Semi-Bold
- Body: 16pt, Regular (minimum for accessibility)

---

## 📱 Features to Implement

1. ✅ Navigation structure
2. ✅ API service layer
3. ✅ State management (Redux)
4. ✅ Theme system
5. ⏭️ Onboarding screens
6. ⏭️ Home screen
7. ⏭️ Session screen
8. ⏭️ Journal screen
9. ⏭️ Analytics screen
10. ⏭️ Resources screen

---

**Mobile app structure is ready!** 🚀

