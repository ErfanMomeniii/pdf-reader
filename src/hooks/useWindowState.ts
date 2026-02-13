import { useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { saveWindowState, restoreWindowState } from '../services/windowStateService';

export function useWindowState() {
  useEffect(() => {
    restoreWindowState();

    const window = getCurrentWindow();
    let saveTimeout: ReturnType<typeof setTimeout> | null = null;

    const debouncedSave = () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
      saveTimeout = setTimeout(() => {
        saveWindowState();
      }, 500);
    };

    const unlistenMove = window.onMoved(debouncedSave);
    const unlistenResize = window.onResized(debouncedSave);

    const handleBeforeUnload = () => {
      saveWindowState();
    };
    globalThis.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
      unlistenMove.then((fn) => fn());
      unlistenResize.then((fn) => fn());
      globalThis.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
}
