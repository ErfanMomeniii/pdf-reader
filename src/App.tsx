import { useCallback } from 'react';
import { useDocumentStore } from './stores/documentStore';
import { MainLayout } from './components/MainLayout';
import { Toolbar } from './components/Toolbar';
import { DocumentViewer } from './components/DocumentViewer';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ErrorDisplay } from './components/ErrorDisplay';
import { LoadingIndicator } from './components/LoadingIndicator';
import { useFileDrop } from './hooks/useFileDrop';
import { useOpenFile } from './hooks/useOpenFile';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useMenuEvents } from './hooks/useMenuEvents';
import { useWindowState } from './hooks/useWindowState';
import './App.css';

function App() {
  const { document, isLoading, error, clearError, setError } = useDocumentStore();
  const { openFromBytes } = useOpenFile();

  useKeyboardShortcuts();
  useMenuEvents();
  useWindowState();

  const handleFileDrop = useCallback(async (response: Awaited<ReturnType<typeof import('./services/fileService').openFile>>) => {
    if (response.success) {
      await openFromBytes(response.data, response.filePath);
    } else if (response.error) {
      setError({
        type: 'unknown',
        message: response.error,
      });
    }
  }, [openFromBytes, setError]);

  const handleDropError = useCallback((message: string) => {
    setError({
      type: 'invalid',
      message,
    });
  }, [setError]);

  const { isDragging } = useFileDrop({
    onFile: handleFileDrop,
    onError: handleDropError,
  });

  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator message="Opening PDF..." />;
    }
    if (error) {
      return <ErrorDisplay error={error} onDismiss={clearError} />;
    }
    if (document) {
      return <DocumentViewer />;
    }
    return <WelcomeScreen />;
  };

  return (
    <MainLayout toolbar={<Toolbar />} isDragging={isDragging}>
      {renderContent()}
    </MainLayout>
  );
}

export default App;
