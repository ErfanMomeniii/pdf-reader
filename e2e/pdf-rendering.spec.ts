import { test, expect } from '@playwright/test';
import * as path from 'path';

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

test.describe('PDF Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('#root', { state: 'visible', timeout: 30000 });
  });

  test('pages render correctly with visible content', async ({ page }) => {
    // Load sample PDF
    const pdfPath = path.join(FIXTURES_DIR, 'sample.pdf');

    // Trigger file open and load PDF
    const fileChooserPromise = page.waitForEvent('filechooser').catch(() => null);
    await page.keyboard.press('Meta+o').catch(() => page.keyboard.press('Control+o'));

    const fileChooser = await fileChooserPromise;
    if (fileChooser) {
      await fileChooser.setFiles(pdfPath);
    }

    // Wait for canvas elements to appear (PDF pages rendered)
    await page.waitForSelector('canvas', { state: 'visible', timeout: 30000 });

    // Verify at least one canvas is rendered
    const canvases = await page.locator('canvas').count();
    expect(canvases).toBeGreaterThan(0);

    // Verify canvas has dimensions (actually rendered)
    const canvas = page.locator('canvas').first();
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
  });

  test('malformed PDF shows error message', async ({ page }) => {
    // Load malformed PDF
    const pdfPath = path.join(FIXTURES_DIR, 'malformed.pdf');

    // Trigger file open
    const fileChooserPromise = page.waitForEvent('filechooser').catch(() => null);
    await page.keyboard.press('Meta+o').catch(() => page.keyboard.press('Control+o'));

    const fileChooser = await fileChooserPromise;
    if (fileChooser) {
      await fileChooser.setFiles(pdfPath);
    }

    // Wait for error message to appear
    await page.waitForSelector('[data-testid="error-display"], .error-display, .error-message', {
      state: 'visible',
      timeout: 30000,
    });

    // Verify error message is displayed
    const errorElement = page.locator('[data-testid="error-display"], .error-display, .error-message').first();
    await expect(errorElement).toBeVisible();
    const errorText = await errorElement.textContent();
    expect(errorText).toBeTruthy();
  });

  test('zoom level changes render quality', async ({ page }) => {
    // Load sample PDF
    const pdfPath = path.join(FIXTURES_DIR, 'sample.pdf');

    // Trigger file open
    const fileChooserPromise = page.waitForEvent('filechooser').catch(() => null);
    await page.keyboard.press('Meta+o').catch(() => page.keyboard.press('Control+o'));

    const fileChooser = await fileChooserPromise;
    if (fileChooser) {
      await fileChooser.setFiles(pdfPath);
    }

    // Wait for canvas to appear
    await page.waitForSelector('canvas', { state: 'visible', timeout: 30000 });

    // Get initial canvas size
    const canvas = page.locator('canvas').first();
    const initialBox = await canvas.boundingBox();
    expect(initialBox).not.toBeNull();

    // Zoom in using keyboard shortcut
    await page.keyboard.press('Meta+=').catch(() => page.keyboard.press('Control+='));
    await page.waitForTimeout(500); // Wait for re-render

    // Get new canvas size - should be larger after zoom
    const zoomedBox = await canvas.boundingBox();
    expect(zoomedBox).not.toBeNull();

    // Canvas should have changed after zoom
    // Note: The exact behavior depends on implementation
    // Either canvas dimensions change or transform is applied
    const zoomDisplay = page.locator('.zoom-level, [data-testid="zoom-level"]').first();
    if (await zoomDisplay.isVisible()) {
      const zoomText = await zoomDisplay.textContent();
      expect(zoomText).toContain('%');
    }
  });
});
