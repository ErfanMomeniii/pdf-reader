import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { useDocumentStore } from '../stores/documentStore';
import { useOpenFile } from './useOpenFile';

export function useMenuEvents() {
  const { zoomIn, zoomOut, resetZoom, closeDocument, goToNextPage, goToPreviousPage } = useDocumentStore();
  const { openDialog } = useOpenFile();

  useEffect(() => {
    const unlisten = listen<string>('menu-event', (event) => {
      switch (event.payload) {
        case 'open':
          openDialog();
          break;
        case 'close':
          closeDocument();
          break;
        case 'zoom_in':
          zoomIn();
          break;
        case 'zoom_out':
          zoomOut();
          break;
        case 'actual_size':
          resetZoom();
          break;
        case 'next_page':
          goToNextPage();
          break;
        case 'prev_page':
          goToPreviousPage();
          break;
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [openDialog, closeDocument, zoomIn, zoomOut, resetZoom, goToNextPage, goToPreviousPage]);
}
