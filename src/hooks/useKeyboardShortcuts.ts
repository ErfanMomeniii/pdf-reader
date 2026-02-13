import { useEffect, useCallback } from 'react';
import { useDocumentStore } from '../stores/documentStore';
import { useOpenFile } from './useOpenFile';

export function useKeyboardShortcuts() {
  const {
    document,
    goToNextPage,
    goToPreviousPage,
    zoomIn,
    zoomOut,
    resetZoom,
    closeDocument,
    setZoomMode,
  } = useDocumentStore();

  const { openDialog } = useOpenFile();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    const isMod = e.metaKey || e.ctrlKey;

    // Global shortcuts (work without document)
    if (isMod && e.key.toLowerCase() === 'o') {
      e.preventDefault();
      openDialog();
      return;
    }

    // Document-specific shortcuts
    if (!document) return;

    if (isMod && e.key.toLowerCase() === 'w') {
      e.preventDefault();
      closeDocument();
      return;
    }

    switch (e.key) {
      case 'ArrowRight':
        if (!isMod) {
          e.preventDefault();
          goToNextPage();
        }
        break;

      case 'ArrowLeft':
        if (!isMod) {
          e.preventDefault();
          goToPreviousPage();
        }
        break;

      case ']':
        if (isMod) {
          e.preventDefault();
          goToNextPage();
        }
        break;

      case '[':
        if (isMod) {
          e.preventDefault();
          goToPreviousPage();
        }
        break;

      case 'PageDown':
        e.preventDefault();
        goToNextPage();
        break;

      case 'PageUp':
        e.preventDefault();
        goToPreviousPage();
        break;

      case 'Home':
        e.preventDefault();
        useDocumentStore.getState().setCurrentPage(1);
        break;

      case 'End':
        e.preventDefault();
        useDocumentStore.getState().setCurrentPage(document.numPages);
        break;

      case '+':
      case '=':
        if (isMod) {
          e.preventDefault();
          zoomIn();
        }
        break;

      case '-':
        if (isMod) {
          e.preventDefault();
          zoomOut();
        }
        break;

      case '0':
        if (isMod) {
          e.preventDefault();
          resetZoom();
        }
        break;

      case '1':
        if (isMod) {
          e.preventDefault();
          setZoomMode('fit-page');
        }
        break;

      case '2':
        if (isMod) {
          e.preventDefault();
          setZoomMode('fit-width');
        }
        break;
    }
  }, [document, goToNextPage, goToPreviousPage, zoomIn, zoomOut, resetZoom, openDialog, closeDocument, setZoomMode]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
