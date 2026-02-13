import { Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

export const FIXTURES_DIR = path.join(__dirname, '..', 'fixtures');

export function getFixturePath(filename: string): string {
  return path.join(FIXTURES_DIR, filename);
}

export async function loadPdfViaFileChooser(page: Page, pdfPath: string): Promise<void> {
  // For Tauri apps, we typically need to use the app's file open mechanism
  // This helper simulates the file chooser interaction

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser', { timeout: 10000 }).catch(() => null),
    // Trigger file open via menu or keyboard shortcut
    page.keyboard.press('Meta+o').catch(() => page.keyboard.press('Control+o')),
  ]);

  if (fileChooser) {
    await fileChooser.setFiles(pdfPath);
  }
}

export async function loadPdfViaDragDrop(page: Page, pdfPath: string): Promise<void> {
  const fileContent = fs.readFileSync(pdfPath);
  const dataTransfer = await page.evaluateHandle((data) => {
    const dt = new DataTransfer();
    const file = new File([new Uint8Array(data)], 'test.pdf', { type: 'application/pdf' });
    dt.items.add(file);
    return dt;
  }, Array.from(fileContent));

  const dropTarget = page.locator('[data-testid="drop-zone"], .drop-zone, #root').first();

  await dropTarget.dispatchEvent('dragenter', { dataTransfer });
  await dropTarget.dispatchEvent('dragover', { dataTransfer });
  await dropTarget.dispatchEvent('drop', { dataTransfer });
}

export async function openRecentFile(page: Page, index: number = 0): Promise<void> {
  // Click on recent files menu or list item
  const recentFileItem = page.locator('[data-testid="recent-file-item"], .recent-file-item').nth(index);
  await recentFileItem.click();
}
