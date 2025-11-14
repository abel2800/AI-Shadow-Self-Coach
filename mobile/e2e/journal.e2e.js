/**
 * Journal Flow E2E Tests
 */

describe('Journal Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should view journal entries', async () => {
    // Navigate to Journal tab
    await element(by.id('journal-tab')).tap();
    await expect(element(by.id('journal-screen'))).toBeVisible();

    // Should show journal entries list
    await expect(element(by.id('journal-entries-list'))).toBeVisible();

    // Should show at least one entry (if exists)
    // This depends on having completed sessions
  });

  it('should view journal entry details', async () => {
    // Navigate to Journal
    await element(by.id('journal-tab')).tap();

    // Tap on first entry
    await element(by.id('journal-entry-0')).tap();

    // Entry details should appear
    await expect(element(by.id('journal-entry-detail'))).toBeVisible();
    await expect(element(by.id('entry-summary'))).toBeVisible();
    await expect(element(by.id('entry-transcript'))).toBeVisible();

    // Go back
    await element(by.id('back-button')).tap();
    await expect(element(by.id('journal-screen'))).toBeVisible();
  });

  it('should search journal entries', async () => {
    // Navigate to Journal
    await element(by.id('journal-tab')).tap();

    // Tap search
    await element(by.id('journal-search-button')).tap();

    // Type search query
    await element(by.id('journal-search-input')).typeText('stress');

    // Results should filter
    await waitFor(element(by.id('journal-entries-list')))
      .toBeVisible()
      .withTimeout(2000);

    // Clear search
    await element(by.id('journal-search-clear')).tap();
  });

  it('should filter journal by tags', async () => {
    // Navigate to Journal
    await element(by.id('journal-tab')).tap();

    // Tap filter button
    await element(by.id('journal-filter-button')).tap();

    // Select a tag
    await element(by.id('tag-anxiety')).tap();

    // Apply filter
    await element(by.id('apply-filter-button')).tap();

    // Entries should be filtered
    await expect(element(by.id('journal-entries-list'))).toBeVisible();
  });

  it('should export journal entry', async () => {
    // Navigate to Journal
    await element(by.id('journal-tab')).tap();

    // Open entry
    await element(by.id('journal-entry-0')).tap();

    // Tap export button
    await element(by.id('export-entry-button')).tap();

    // Export options should appear
    await expect(element(by.text('Export as PDF'))).toBeVisible();
    await expect(element(by.text('Export as Text'))).toBeVisible();

    // Select PDF export
    await element(by.id('export-pdf-button')).tap();

    // Share sheet should appear (platform dependent)
    // On iOS, this would show native share sheet
    // On Android, this would show share intent
  });

  it('should add highlight to journal entry', async () => {
    // Navigate to Journal
    await element(by.id('journal-tab')).tap();

    // Open entry
    await element(by.id('journal-entry-0')).tap();

    // Long press on a message
    await element(by.id('message-0')).longPress();

    // Highlight option should appear
    await expect(element(by.text('Add Highlight'))).toBeVisible();
    await element(by.id('add-highlight-button')).tap();

    // Add note
    await element(by.id('highlight-note-input')).typeText('Key insight');
    await element(by.id('save-highlight-button')).tap();

    // Highlight should be saved
    await expect(element(by.id('highlight-0'))).toBeVisible();
  });
});

