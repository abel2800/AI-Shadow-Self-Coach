# E2E Testing Guide
## End-to-End Tests for Mobile App

This guide explains how to run and write E2E tests for the Shadow Coach mobile app using Detox.

---

## 🎯 Overview

E2E tests cover:
- **Onboarding Flow** - Welcome, Privacy, Mood, Preferences
- **Session Flow** - Start, chat, end session
- **Journal Flow** - View, search, filter, export entries
- **Analytics Flow** - View charts, insights, mood history
- **Home Screen** - Daily check-in, quick actions
- **Emergency Flow** - High-risk detection and crisis resources

---

## 🚀 Setup

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Install Detox CLI (Global)

```bash
npm install -g detox-cli
```

### 3. Build App for Testing

**iOS:**
```bash
npm run build:e2e:ios
```

**Android:**
```bash
npm run build:e2e:android
```

---

## 🧪 Running Tests

### Run All E2E Tests

```bash
npm run test:e2e
```

### Run Tests for Specific Platform

**iOS:**
```bash
npm run test:e2e:ios
```

**Android:**
```bash
npm run test:e2e:android
```

### Run Specific Test File

```bash
detox test e2e/onboarding.e2e.js --configuration ios.sim.debug
```

### Run with Verbose Output

```bash
detox test --loglevel verbose
```

---

## 📝 Test Structure

```
mobile/e2e/
├── jest.config.js          # Jest configuration
├── helpers.js              # Test helper functions
├── onboarding.e2e.js       # Onboarding flow tests
├── session.e2e.js          # Session flow tests
├── journal.e2e.js          # Journal flow tests
├── analytics.e2e.js        # Analytics flow tests
└── home.e2e.js             # Home screen tests
```

---

## ✍️ Writing Tests

### Basic Test Structure

```javascript
describe('Feature Name', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should do something', async () => {
    // Test steps
    await expect(element(by.id('element-id'))).toBeVisible();
    await element(by.id('button-id')).tap();
  });
});
```

### Common Actions

**Tap Element:**
```javascript
await element(by.id('button-id')).tap();
```

**Type Text:**
```javascript
await element(by.id('input-id')).typeText('Hello');
```

**Wait for Element:**
```javascript
await waitFor(element(by.id('element-id')))
  .toBeVisible()
  .withTimeout(5000);
```

**Scroll:**
```javascript
await element(by.id('scroll-view')).scroll(200, 'down');
```

**Swipe:**
```javascript
await element(by.id('slider')).swipe('right', 'fast', 0.7);
```

---

## 🏷️ Test IDs

All interactive elements should have `testID` props:

```javascript
<TouchableOpacity testID="start-session-button">
  <Text>Start Session</Text>
</TouchableOpacity>
```

### Naming Convention

- Screens: `{screen-name}-screen`
- Buttons: `{action}-button`
- Inputs: `{field-name}-input`
- Lists: `{list-name}-list`
- Items: `{item-name}-{index}`

---

## 🔧 Configuration

### iOS Simulator

Edit `.detoxrc.js` to change simulator:

```javascript
devices: {
  simulator: {
    type: 'ios.simulator',
    device: {
      type: 'iPhone 14 Pro'  // Change here
    }
  }
}
```

### Android Emulator

Edit `.detoxrc.js` to change emulator:

```javascript
devices: {
  emulator: {
    type: 'android.emulator',
    device: {
      avdName: 'Pixel_5_API_33'  // Change here
    }
  }
}
```

---

## 🐛 Debugging

### View Test Logs

```bash
detox test --loglevel verbose
```

### Take Screenshots

```javascript
await device.takeScreenshot('screenshot-name');
```

### Reload App

```javascript
await device.reloadReactNative();
```

### Use Debugger

Add breakpoint in test:
```javascript
await device.launchApp({ newInstance: true });
// Add breakpoint here
```

---

## 📊 Test Coverage

### Onboarding Flow
- ✅ Complete onboarding
- ✅ Skip optional steps
- ✅ Validate required fields

### Session Flow
- ✅ Start and complete session
- ✅ Handle check-in session
- ✅ Emergency modal for high-risk
- ✅ Pause and resume session

### Journal Flow
- ✅ View journal entries
- ✅ View entry details
- ✅ Search entries
- ✅ Filter by tags
- ✅ Export entry
- ✅ Add highlights

### Analytics Flow
- ✅ View dashboard
- ✅ View mood history
- ✅ Filter by date range
- ✅ View insights

### Home Screen
- ✅ Display home screen
- ✅ Complete daily check-in
- ✅ Navigate to session
- ✅ Show recent sessions
- ✅ Quick actions

---

## 🚨 Common Issues

### Tests Timeout

**Solution:** Increase timeout in `jest.config.js`:
```javascript
testTimeout: 120000  // 2 minutes
```

### Element Not Found

**Solution:** 
- Check `testID` is set correctly
- Wait for element to appear:
```javascript
await waitFor(element(by.id('element-id')))
  .toBeVisible()
  .withTimeout(10000);
```

### App Crashes

**Solution:**
- Check app logs
- Verify app builds correctly
- Check for memory issues

---

## 📚 Resources

- [Detox Documentation](https://wix.github.io/Detox/)
- [Detox API Reference](https://github.com/wix/Detox/blob/master/docs/APIRef.Methods.md)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

---

## ✅ Best Practices

1. **Use Test IDs** - Always use `testID` instead of text matching
2. **Wait for Elements** - Use `waitFor` for async operations
3. **Clean State** - Reload app between tests
4. **Descriptive Names** - Use clear test descriptions
5. **Isolate Tests** - Each test should be independent
6. **Handle Async** - Always await async operations

---

**E2E tests are ready!** 🎯

Run `npm run test:e2e` to execute all tests.

