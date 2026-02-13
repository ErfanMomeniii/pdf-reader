import { getCurrentWindow, PhysicalPosition, PhysicalSize } from '@tauri-apps/api/window';
import { load, Store } from '@tauri-apps/plugin-store';

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  maximized: boolean;
}

const STORE_KEY = 'window-state';
let store: Store | null = null;

async function getStore(): Promise<Store> {
  if (!store) {
    store = await load('settings.json');
  }
  return store;
}

export async function saveWindowState(): Promise<void> {
  try {
    const window = getCurrentWindow();
    const position = await window.outerPosition();
    const size = await window.innerSize();
    const maximized = await window.isMaximized();

    const state: WindowState = {
      x: position.x,
      y: position.y,
      width: size.width,
      height: size.height,
      maximized,
    };

    const s = await getStore();
    await s.set(STORE_KEY, state);
    await s.save();
  } catch (err) {
    console.warn('Failed to save window state:', err);
  }
}

export async function restoreWindowState(): Promise<void> {
  try {
    const s = await getStore();
    const state = await s.get<WindowState>(STORE_KEY);

    if (!state) return;

    const window = getCurrentWindow();

    if (state.maximized) {
      await window.maximize();
    } else {
      await window.setPosition(new PhysicalPosition(state.x, state.y));
      await window.setSize(new PhysicalSize(state.width, state.height));
    }
  } catch (err) {
    console.warn('Failed to restore window state:', err);
  }
}
