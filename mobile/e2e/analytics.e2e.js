/**
 * Analytics Flow E2E Tests
 */

describe('Analytics Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should view analytics dashboard', async () => {
    // Navigate to Analytics tab
    await element(by.id('analytics-tab')).tap();
    await expect(element(by.id('analytics-screen'))).toBeVisible();

    // Should show mood chart
    await expect(element(by.id('mood-chart'))).toBeVisible();

    // Should show session stats
    await expect(element(by.id('session-stats'))).toBeVisible();

    // Should show insights
    await expect(element(by.id('insights-section'))).toBeVisible();
  });

  it('should view mood history', async () => {
    // Navigate to Analytics
    await element(by.id('analytics-tab')).tap();

    // Tap on mood chart
    await element(by.id('mood-chart')).tap();

    // Mood history should expand
    await expect(element(by.id('mood-history-list'))).toBeVisible();

    // Should show mood entries
    await expect(element(by.id('mood-entry-0'))).toBeVisible();
  });

  it('should filter analytics by date range', async () => {
    // Navigate to Analytics
    await element(by.id('analytics-tab')).tap();

    // Tap date filter
    await element(by.id('date-filter-button')).tap();

    // Select date range
    await element(by.id('date-range-last-week')).tap();

    // Analytics should update
    await waitFor(element(by.id('mood-chart')))
      .toBeVisible()
      .withTimeout(2000);
  });

  it('should view session insights', async () => {
    // Navigate to Analytics
    await element(by.id('analytics-tab')).tap();

    // Scroll to insights
    await element(by.id('analytics-screen')).scroll(300, 'down');

    // Tap on an insight
    await element(by.id('insight-0')).tap();

    // Insight details should appear
    await expect(element(by.id('insight-detail'))).toBeVisible();
  });
});

