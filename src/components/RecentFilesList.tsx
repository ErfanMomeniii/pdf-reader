import { useCallback } from 'react';
import { useRecentFilesStore, type RecentFile } from '../stores/recentFilesStore';

interface RecentFilesListProps {
  onFileSelect: (path: string) => void;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export function RecentFilesList({ onFileSelect }: RecentFilesListProps) {
  const { files, clearAll } = useRecentFilesStore();

  const handleFileClick = useCallback((file: RecentFile) => {
    onFileSelect(file.path);
  }, [onFileSelect]);

  const handleClearAll = useCallback(() => {
    clearAll();
  }, [clearAll]);

  if (files.length === 0) {
    return (
      <div className="recent-files-empty">
        <p>No recent files</p>
      </div>
    );
  }

  return (
    <div className="recent-files-list">
      <div className="recent-files-header">
        <h3>Recent Files</h3>
        <button className="clear-recent-btn" onClick={handleClearAll}>
          Clear All
        </button>
      </div>
      <ul className="recent-files">
        {files.map((file) => (
          <li key={file.path} className="recent-file-item">
            <button
              className="recent-file-button"
              onClick={() => handleFileClick(file)}
              title={file.path}
            >
              <svg
                className="file-icon"
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
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="file-name">{file.name}</span>
              <span className="file-date">{formatTimestamp(file.timestamp)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
