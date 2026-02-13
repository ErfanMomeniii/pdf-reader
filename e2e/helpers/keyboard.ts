import { Page } from '@playwright/test';

const isMac = process.platform === 'darwin';

export const MODIFIER = isMac ? 'Meta' : 'Control';

export interface KeyboardShortcut {
  key: string;
  modifiers?: readonly string[];
}

export const SHORTCUTS = {
  openFile: { key: 'o', modifiers: [MODIFIER] },
  nextPage: { key: 'ArrowRight' },
  previousPage: { key: 'ArrowLeft' },
  firstPage: { key: 'Home' },
  lastPage: { key: 'End' },
  zoomIn: { key: '=', modifiers: [MODIFIER] },
  zoomOut: { key: '-', modifiers: [MODIFIER] },
  resetZoom: { key: '0', modifiers: [MODIFIER] },
  pageDown: { key: 'PageDown' },
  pageUp: { key: 'PageUp' },
} as const;

export async function pressShortcut(page: Page, shortcut: KeyboardShortcut): Promise<void> {
  const keys = [...(shortcut.modifiers || []), shortcut.key];
  await page.keyboard.press(keys.join('+'));
}

export async function navigateToNextPage(page: Page): Promise<void> {
  await pressShortcut(page, SHORTCUTS.nextPage);
}

export async function navigateToPreviousPage(page: Page): Promise<void> {
  await pressShortcut(page, SHORTCUTS.previousPage);
}

export async function navigateToFirstPage(page: Page): Promise<void> {
  await pressShortcut(page, SHORTCUTS.firstPage);
}

export async function navigateToLastPage(page: Page): Promise<void> {
  await pressShortcut(page, SHORTCUTS.lastPage);
}

export async function zoomIn(page: Page): Promise<void> {
  await pressShortcut(page, SHORTCUTS.zoomIn);
}

export async function zoomOut(page: Page): Promise<void> {
  await pressShortcut(page, SHORTCUTS.zoomOut);
}

export async function resetZoom(page: Page): Promise<void> {
  await pressShortcut(page, SHORTCUTS.resetZoom);
}

export async function triggerFileOpen(page: Page): Promise<void> {
  await pressShortcut(page, SHORTCUTS.openFile);
}
