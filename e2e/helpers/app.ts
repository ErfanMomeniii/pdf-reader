import { Page, expect } from '@playwright/test';
import * as path from 'path';

export const FIXTURES_DIR = path.join(__dirname, '..', 'fixtures');

export function getFixturePath(filename: string): string {
  return path.join(FIXTURES_DIR, filename);
}

export async function waitForAppReady(page: Page): Promise<void> {
  // Wait for the main app container to be visible
  await page.waitForSelector('[data-testid="app-container"], .app-container, #root', {
    state: 'visible',
    timeout: 30000,
  });
}

export async function waitForPdfLoaded(page: Page): Promise<void> {
  // Wait for PDF viewer to show content
  await page.waitForSelector('[data-testid="document-viewer"], .document-viewer, canvas', {
    state: 'visible',
    timeout: 30000,
  });
}

export async function waitForWelcomeScreen(page: Page): Promise<void> {
  // Wait for welcome screen to be visible
  await page.waitForSelector('[data-testid="welcome-screen"], .welcome-screen', {
    state: 'visible',
    timeout: 10000,
  });
}

export async function getPageNumber(page: Page): Promise<number> {
  const pageInput = page.locator('[data-testid="page-input"], input[type="number"]').first();
  const value = await pageInput.inputValue();
  return parseInt(value, 10);
}

export async function getTotalPages(page: Page): Promise<number> {
  const totalPagesEl = page.locator('[data-testid="total-pages"], .total-pages').first();
  const text = await totalPagesEl.textContent();
  const match = text?.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export async function getZoomLevel(page: Page): Promise<number> {
  const zoomDisplay = page.locator('[data-testid="zoom-level"], .zoom-level').first();
  const text = await zoomDisplay.textContent();
  const match = text?.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 100;
}
