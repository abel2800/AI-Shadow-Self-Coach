/**
 * Home Screen E2E Tests
 */

describe('Home Screen', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display home screen with daily check-in', async () => {
    // Home screen should be visible
    await expect(element(by.id('home-screen'))).toBeVisible();

    // Should show greeting
    await expect(element(by.id('greeting-text'))).toBeVisible();

    // Should show daily check-in prompt
    await expect(element(by.id('daily-check-in'))).toBeVisible();
  });

  it('should complete daily mood check-in', async () => {
    // Tap on daily check-in
    await element(by.id('daily-check-in-button')).tap();

    // Mood check-in modal should appear
    await expect(element(by.id('mood-check-in-modal'))).toBeVisible();

    // Set mood
    await element(by.id('mood-slider')).swipe('right', 'fast', 0.7);

    // Add optional notes
    await element(by.id('mood-notes-input')).typeText('Feeling good');

    // Submit
    await element(by.id('submit-mood-button')).tap();

    // Modal should close
    await waitFor(element(by.id('mood-check-in-modal')))
      .not.toBeVisible()
      .withTimeout(2000);

    // Check-in should be marked as complete
    await expect(element(by.id('check-in-complete'))).toBeVisible();
  });

  it('should navigate to session from home', async () => {
    // Tap start session button
    await element(by.id('start-session-button')).tap();

    // Should navigate to session type selection
    await expect(element(by.id('session-type-selection'))).toBeVisible();
  });

  it('should show recent sessions', async () => {
    // Scroll to recent sessions
    await element(by.id('home-screen')).scroll(200, 'down');

    // Should show recent sessions section
    await expect(element(by.id('recent-sessions'))).toBeVisible();

    // Tap on a recent session
    await element(by.id('recent-session-0')).tap();

    // Should navigate to session summary
    await expect(element(by.id('session-summary-screen'))).toBeVisible();
  });

  it('should show quick actions', async () => {
    // Should show quick action buttons
    await expect(element(by.id('quick-action-journal'))).toBeVisible();
    await expect(element(by.id('quick-action-resources'))).toBeVisible();

    // Tap journal quick action
    await element(by.id('quick-action-journal')).tap();

    // Should navigate to journal
    await expect(element(by.id('journal-screen'))).toBeVisible();
  });
});

