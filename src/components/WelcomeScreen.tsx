import { RecentFilesList } from './RecentFilesList';
import { useOpenFile } from '../hooks/useOpenFile';

export function WelcomeScreen() {
  const { openDialog, openRecent } = useOpenFile();

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-logo">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <h1 className="welcome-title">PDF Reader</h1>
        <p className="welcome-subtitle">
          A lightweight, fast PDF viewer
        </p>

        <button className="open-file-button" onClick={openDialog}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          Open PDF File
        </button>

        <p className="drop-hint">
          or drag and drop a PDF file here
        </p>

        <div className="recent-files-section">
          <RecentFilesList onFileSelect={openRecent} />
        </div>
      </div>
    </div>
  );
}
