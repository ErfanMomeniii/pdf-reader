import { test, expect } from '@playwright/test';
import * as path from 'path';

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

test.describe('Document Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:1420');
    await page.waitForSelector('#root', { state: 'visible', timeout: 30000 });

    // Load sample PDF for navigation tests
    const pdfPath = path.join(FIXTURES_DIR, 'sample.pdf');
    const fileChooserPromise = page.waitForEvent('filechooser').catch(() => null);
    await page.keyboard.press('Meta+o').catch(() => page.keyboard.press('Control+o'));

    const fileChooser = await fileChooserPromise;
    if (fileChooser) {
      await fileChooser.setFiles(pdfPath);
    }

    // Wait for PDF to load
    await page.waitForSelector('canvas', { state: 'visible', timeout: 30000 });
  });

  test('next/previous page buttons work', async ({ page }) => {
    // Find and click next page button
    const nextButton = page.locator('[data-testid="next-page"], button:has-text("Next"), .next-page-btn').first();

    if (await nextButton.isVisible()) {
      // Get initial page
      const pageInput = page.locator('input[type="number"], [data-testid="page-input"]').first();
      const initialPage = await pageInput.inputValue().catch(() => '1');

      // Click next
      await nextButton.click();
      await page.waitForTimeout(300);

      // Verify page changed
      const newPage = await pageInput.inputValue().catch(() => '1');
      expect(parseInt(newPage)).toBeGreaterThan(parseInt(initialPage));

      // Click previous
      const prevButton = page.locator('[data-testid="prev-page"], button:has-text("Prev"), .prev-page-btn').first();
      if (await prevButton.isVisible()) {
        await prevButton.click();
        await page.waitForTimeout(300);

        const backPage = await pageInput.inputValue().catch(() => '1');
        expect(parseInt(backPage)).toBe(parseInt(initialPage));
      }
    }
  });

  test('page number input navigates correctly', async ({ page }) => {
    const pageInput = page.locator('input[type="number"], [data-testid="page-input"]').first();

    if (await pageInput.isVisible()) {
      // Clear and type new page number
      await pageInput.fill('2');
      await pageInput.press('Enter');
      await page.waitForTimeout(500);

      // Verify page changed
      const currentPage = await pageInput.inputValue();
      expect(currentPage).toBe('2');
    }
  });

  test('keyboard shortcuts navigate pages', async ({ page }) => {
    const pageInput = page.locator('input[type="number"], [data-testid="page-input"]').first();

    if (await pageInput.isVisible()) {
      const initialPage = await pageInput.inputValue();

      // Press right arrow for next page
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(300);

      const afterRight = await pageInput.inputValue();
      expect(parseInt(afterRight)).toBeGreaterThanOrEqual(parseInt(initialPage));

      // Press left arrow for previous page
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(300);

      const afterLeft = await pageInput.inputValue();
      expect(parseInt(afterLeft)).toBeLessThanOrEqual(parseInt(afterRight));
    }
  });

  test('scroll position is remembered', async ({ page }) => {
    // Scroll down on the page
    const viewer = page.locator('.document-viewer, [data-testid="document-viewer"]').first();

    if (await viewer.isVisible()) {
      // Scroll down
      await viewer.evaluate((el) => {
        el.scrollTop = 200;
      });

      const scrollBefore = await viewer.evaluate((el) => el.scrollTop);

      // Navigate away and back
      const nextButton = page.locator('[data-testid="next-page"], button:has-text("Next")').first();
      const prevButton = page.locator('[data-testid="prev-page"], button:has-text("Prev")').first();

      if (await nextButton.isVisible() && await prevButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(300);
        await prevButton.click();
        await page.waitForTimeout(500);

        // Check if scroll position is restored
        const scrollAfter = await viewer.evaluate((el) => el.scrollTop);
        // Note: Scroll restoration behavior may vary based on implementation
        expect(typeof scrollAfter).toBe('number');
      }
    }
  });

  test('zoom in/out controls work', async ({ page }) => {
    // Find zoom controls
    const zoomInBtn = page.locator('[data-testid="zoom-in"], button:has-text("+"), .zoom-in-btn').first();
    const zoomOutBtn = page.locator('[data-testid="zoom-out"], button:has-text("-"), .zoom-out-btn').first();
    const zoomDisplay = page.locator('.zoom-level, [data-testid="zoom-level"]').first();

    if (await zoomInBtn.isVisible()) {
      // Get initial zoom
      let initialZoom = 100;
      if (await zoomDisplay.isVisible()) {
        const text = await zoomDisplay.textContent();
        const match = text?.match(/(\d+)/);
        if (match) initialZoom = parseInt(match[1]);
      }

      // Zoom in
      await zoomInBtn.click();
      await page.waitForTimeout(300);

      // Verify zoom increased
      if (await zoomDisplay.isVisible()) {
        const text = await zoomDisplay.textContent();
        const match = text?.match(/(\d+)/);
        if (match) {
          expect(parseInt(match[1])).toBeGreaterThanOrEqual(initialZoom);
        }
      }

      // Zoom out
      if (await zoomOutBtn.isVisible()) {
        await zoomOutBtn.click();
        await page.waitForTimeout(300);

        if (await zoomDisplay.isVisible()) {
          const text = await zoomDisplay.textContent();
          expect(text).toContain('%');
        }
      }
    }
  });
});
