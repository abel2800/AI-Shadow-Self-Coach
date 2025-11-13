# Shadow Coach Mobile App
## React Native Mobile Application

**Version:** 1.0.0  
**Platform:** iOS & Android

---

## Setup

### Prerequisites

1. **Node.js** (v18.0.0 or higher)
2. **React Native CLI**
   ```bash
   npm install -g react-native-cli
   ```

3. **For iOS:**
   - Xcode (Mac only)
   - CocoaPods: `sudo gem install cocoapods`

4. **For Android:**
   - Android Studio
   - Android SDK
   - Java Development Kit (JDK)

### Installation

```bash
cd mobile
npm install
cd ios && pod install && cd ..
```

### Running the App

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

**Start Metro Bundler:**
```bash
npm start
```

---

## Project Structure

```
mobile/
├── src/
│   ├── screens/          # Screen components
│   ├── components/       # Reusable components
│   ├── services/         # API services
│   ├── store/            # Redux store
│   ├── navigation/       # Navigation setup
│   ├── theme/            # Design system
│   └── utils/            # Utility functions
├── assets/               # Images, fonts
├── android/              # Android native code
├── ios/                   # iOS native code
└── package.json
```

---

## Features

- ✅ Onboarding flow
- ✅ Home screen with daily check-in
- ✅ Session screen with chat interface
- ✅ Journal screen with timeline
- ✅ Analytics screen with charts
- ✅ Resources & Help screen
- ✅ Emergency modal for high-risk detection

---

## API Integration

The app connects to the backend API at:
- **Development:** `http://localhost:3000/api/v1`
- **Production:** (configure in `.env`)

---

## Environment Variables

Create `.env` file:
```
API_BASE_URL=http://localhost:3000/api/v1
```

---

## Next Steps

1. Set up React Native project
2. Install dependencies
3. Configure navigation
4. Create screen components
5. Integrate with backend API

---

**Ready for development!** 🚀

