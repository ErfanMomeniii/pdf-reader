import { useEffect, useCallback, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { openFile, type FileOpenResponse } from '../services/fileService';

interface FileDropPayload {
  paths: string[];
  position: { x: number; y: number };
}

interface UseFileDropOptions {
  onFile: (response: FileOpenResponse) => void;
  onError?: (message: string) => void;
}

export function useFileDrop({ onFile, onError }: UseFileDropOptions) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileDrop = useCallback(async (payload: FileDropPayload) => {
    setIsDragging(false);

    const paths = payload.paths;
    if (!paths || paths.length === 0) return;

    const filePath = paths[0];
    const ext = filePath.toLowerCase().split('.').pop();

    if (ext !== 'pdf') {
      onError?.('Only PDF files are supported');
      return;
    }

    const response = await openFile(filePath);
    onFile(response);
  }, [onFile, onError]);

  useEffect(() => {
    const unlistenDrop = listen<FileDropPayload>('tauri://drag-drop', (event) => {
      handleFileDrop(event.payload);
    });

    const unlistenEnter = listen('tauri://drag-enter', () => {
      setIsDragging(true);
    });

    const unlistenLeave = listen('tauri://drag-leave', () => {
      setIsDragging(false);
    });

    return () => {
      unlistenDrop.then((fn) => fn());
      unlistenEnter.then((fn) => fn());
      unlistenLeave.then((fn) => fn());
    };
  }, [handleFileDrop]);

  return { isDragging };
}
