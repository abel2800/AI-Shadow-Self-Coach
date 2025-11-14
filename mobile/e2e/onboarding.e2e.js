/**
 * Onboarding Flow E2E Tests
 */

describe('Onboarding Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete onboarding flow', async () => {
    // 1. Welcome Screen
    await expect(element(by.id('welcome-screen'))).toBeVisible();
    await expect(element(by.text('Welcome to Shadow Coach'))).toBeVisible();
    
    // Tap "Get Started" button
    await element(by.id('welcome-get-started-button')).tap();

    // 2. Privacy Screen
    await expect(element(by.id('privacy-screen'))).toBeVisible();
    await expect(element(by.text('Privacy & Safety'))).toBeVisible();
    
    // Scroll to bottom
    await element(by.id('privacy-content')).scroll(200, 'down');
    
    // Accept privacy policy
    await element(by.id('privacy-accept-checkbox')).tap();
    await element(by.id('privacy-continue-button')).tap();

    // 3. Mood Baseline Screen
    await expect(element(by.id('mood-baseline-screen'))).toBeVisible();
    await expect(element(by.text('How are you feeling today?'))).toBeVisible();
    
    // Set mood slider to 7
    await element(by.id('mood-slider')).swipe('right', 'fast', 0.7);
    
    // Add optional notes
    await element(by.id('mood-notes-input')).typeText('Feeling optimistic today');
    
    // Continue
    await element(by.id('mood-continue-button')).tap();

    // 4. Preferences Screen
    await expect(element(by.id('preferences-screen'))).toBeVisible();
    await expect(element(by.text('Your Preferences'))).toBeVisible();
    
    // Select session length
    await element(by.id('session-length-medium')).tap();
    
    // Enable notifications
    await element(by.id('notifications-toggle')).tap();
    
    // Complete onboarding
    await element(by.id('preferences-complete-button')).tap();

    // 5. Should navigate to Home screen
    await expect(element(by.id('home-screen'))).toBeVisible();
  });

  it('should allow skipping optional steps', async () => {
    // Welcome screen
    await element(by.id('welcome-get-started-button')).tap();

    // Privacy screen - skip notes
    await element(by.id('privacy-accept-checkbox')).tap();
    await element(by.id('privacy-continue-button')).tap();

    // Mood baseline - skip notes
    await element(by.id('mood-slider')).swipe('right', 'fast', 0.5);
    await element(by.id('mood-continue-button')).tap();

    // Preferences - use defaults
    await element(by.id('preferences-complete-button')).tap();

    // Should reach home screen
    await expect(element(by.id('home-screen'))).toBeVisible();
  });

  it('should validate required fields', async () => {
    // Welcome screen
    await element(by.id('welcome-get-started-button')).tap();

    // Privacy - try to continue without accepting
    await element(by.id('privacy-continue-button')).tap();
    
    // Should show error
    await expect(element(by.text('Please accept the privacy policy'))).toBeVisible();
    
    // Accept and continue
    await element(by.id('privacy-accept-checkbox')).tap();
    await element(by.id('privacy-continue-button')).tap();

    // Mood - try to continue without setting mood
    await element(by.id('mood-continue-button')).tap();
    
    // Should show error
    await expect(element(by.text('Please set your mood'))).toBeVisible();
  });
});

