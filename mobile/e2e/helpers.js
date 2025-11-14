/**
 * E2E Test Helpers
 * Utility functions for E2E tests
 */

/**
 * Wait for element to be visible
 */
export async function waitForElement(element, timeout = 10000) {
  await waitFor(element).toBeVisible().withTimeout(timeout);
}

/**
 * Tap element by testID
 */
export async function tapByTestID(testID) {
  await element(by.id(testID)).tap();
}

/**
 * Type text into input by testID
 */
export async function typeTextByTestID(testID, text) {
  await element(by.id(testID)).typeText(text);
}

/**
 * Clear text from input by testID
 */
export async function clearTextByTestID(testID) {
  await element(by.id(testID)).clearText();
}

/**
 * Scroll to element
 */
export async function scrollToElement(testID, direction = 'down') {
  await element(by.id(testID)).scroll(100, direction);
}

/**
 * Wait for text to appear
 */
export async function waitForText(text, timeout = 10000) {
  await waitFor(element(by.text(text))).toBeVisible().withTimeout(timeout);
}

/**
 * Check if element exists
 */
export async function elementExists(testID) {
  try {
    await expect(element(by.id(testID))).toBeVisible();
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Take screenshot
 */
export async function takeScreenshot(name) {
  await device.takeScreenshot(name);
}

/**
 * Reload app
 */
export async function reloadApp() {
  await device.reloadReactNative();
}

/**
 * Go back
 */
export async function goBack() {
  await device.pressBack();
}

/**
 * Mock API response
 */
export function mockApiResponse(endpoint, response, status = 200) {
  // This would integrate with your API mocking library
  // For now, it's a placeholder
  console.log(`Mocking ${endpoint} with status ${status}`);
}

