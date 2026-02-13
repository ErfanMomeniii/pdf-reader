import { useCallback } from 'react';
import { useDocumentStore } from '../stores/documentStore';
import { useRecentFilesStore } from '../stores/recentFilesStore';
import { openFileDialog, openFile as openFilePath } from '../services/fileService';
import { loadPDFFromBytes } from '../services/pdfService';
import { getScrollPosition } from '../services/scrollPositionService';

export function useOpenFile() {
  const { setDocument, setLoading, setError, setCurrentPage, setZoom } = useDocumentStore();
  const { addFile, removeFile } = useRecentFilesStore();

  const openFromBytes = useCallback(async (data: Uint8Array, filePath: string) => {
    setLoading(true);
    setError(null);

    const result = await loadPDFFromBytes(data, filePath);

    if (result.success) {
      setDocument(result.document);
      addFile(filePath);

      const savedPosition = getScrollPosition(filePath);
      if (savedPosition) {
        setCurrentPage(savedPosition.page);
        setZoom(savedPosition.zoom);
      }
    } else {
      setError(result.error);
    }

    setLoading(false);
  }, [setDocument, setLoading, setError, addFile, setCurrentPage, setZoom]);

  const openDialog = useCallback(async () => {
    const response = await openFileDialog();

    if (!response.success) {
      if (!response.cancelled && response.error) {
        setError({
          type: 'unknown',
          message: response.error,
        });
      }
      return;
    }

    await openFromBytes(response.data, response.filePath);
  }, [openFromBytes, setError]);

  const openRecent = useCallback(async (filePath: string) => {
    setLoading(true);
    setError(null);

    const response = await openFilePath(filePath);

    if (!response.success) {
      setLoading(false);

      if (response.error?.includes('not found') || response.error?.includes('No such file')) {
        removeFile(filePath);
        setError({
          type: 'not-found',
          message: `The file "${filePath.split(/[/\\]/).pop()}" could not be found. It may have been moved or deleted.`,
        });
      } else {
        setError({
          type: 'unknown',
          message: response.error || 'Failed to open file',
        });
      }
      return;
    }

    await openFromBytes(response.data, response.filePath);
  }, [openFromBytes, setLoading, setError, removeFile]);

  return {
    openDialog,
    openRecent,
    openFromBytes,
  };
}
