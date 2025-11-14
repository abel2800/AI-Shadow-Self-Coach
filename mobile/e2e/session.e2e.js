/**
 * Session Flow E2E Tests
 */

describe('Session Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
    // Assume user is logged in and on home screen
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should start and complete a gentle deep session', async () => {
    // 1. Navigate to session from home
    await expect(element(by.id('home-screen'))).toBeVisible();
    await element(by.id('start-session-button')).tap();

    // 2. Select session type
    await expect(element(by.id('session-type-selection'))).toBeVisible();
    await element(by.id('session-type-gentle-deep')).tap();
    await element(by.id('session-start-button')).tap();

    // 3. Session screen should appear
    await expect(element(by.id('session-screen'))).toBeVisible();
    await expect(element(by.id('chat-container'))).toBeVisible();

    // 4. Wait for initial assistant message
    await waitFor(element(by.id('assistant-message-0')))
      .toBeVisible()
      .withTimeout(5000);

    // 5. Send a user message
    await element(by.id('chat-input')).typeText('I feel stressed about work');
    await element(by.id('send-button')).tap();

    // 6. Wait for assistant response
    await waitFor(element(by.id('assistant-message-1')))
      .toBeVisible()
      .withTimeout(10000);

    // 7. Continue conversation
    await element(by.id('chat-input')).typeText('It\'s been going on for weeks');
    await element(by.id('send-button')).tap();

    // 8. Wait for response
    await waitFor(element(by.id('assistant-message-2')))
      .toBeVisible()
      .withTimeout(10000);

    // 9. End session
    await element(by.id('end-session-button')).tap();
    
    // Confirm end session
    await expect(element(by.text('End Session?'))).toBeVisible();
    await element(by.id('confirm-end-session-button')).tap();

    // 10. Session summary should appear
    await expect(element(by.id('session-summary-screen'))).toBeVisible();
    await expect(element(by.text('Session Complete'))).toBeVisible();

    // 11. View summary and return home
    await element(by.id('return-home-button')).tap();
    await expect(element(by.id('home-screen'))).toBeVisible();
  });

  it('should handle check-in session', async () => {
    // Start check-in session
    await element(by.id('start-session-button')).tap();
    await element(by.id('session-type-check-in')).tap();
    await element(by.id('session-start-button')).tap();

    // Check-in should be shorter
    await expect(element(by.id('session-screen'))).toBeVisible();
    
    // Send quick message
    await element(by.id('chat-input')).typeText('Feeling good today');
    await element(by.id('send-button')).tap();

    // Wait for response
    await waitFor(element(by.id('assistant-message-1')))
      .toBeVisible()
      .withTimeout(10000);

    // End session
    await element(by.id('end-session-button')).tap();
    await element(by.id('confirm-end-session-button')).tap();
  });

  it('should show emergency modal for high-risk content', async () => {
    // Start session
    await element(by.id('start-session-button')).tap();
    await element(by.id('session-type-gentle-deep')).tap();
    await element(by.id('session-start-button')).tap();

    // Send high-risk message
    await element(by.id('chat-input')).typeText('I want to hurt myself');
    await element(by.id('send-button')).tap();

    // Emergency modal should appear
    await waitFor(element(by.id('emergency-modal')))
      .toBeVisible()
      .withTimeout(5000);

    // Check crisis resources are shown
    await expect(element(by.text('988'))).toBeVisible();
    await expect(element(by.text('Crisis Text Line'))).toBeVisible();

    // Tap "I'm safe now" button
    await element(by.id('emergency-safe-button')).tap();

    // Modal should close
    await waitFor(element(by.id('emergency-modal')))
      .not.toBeVisible()
      .withTimeout(2000);
  });

  it('should allow pausing and resuming session', async () => {
    // Start session
    await element(by.id('start-session-button')).tap();
    await element(by.id('session-type-gentle-deep')).tap();
    await element(by.id('session-start-button')).tap();

    // Send a message
    await element(by.id('chat-input')).typeText('I need to pause');
    await element(by.id('send-button')).tap();

    // Pause session
    await element(by.id('pause-session-button')).tap();
    await expect(element(by.text('Session Paused'))).toBeVisible();

    // Resume session
    await element(by.id('resume-session-button')).tap();
    await expect(element(by.id('session-screen'))).toBeVisible();
  });
});

