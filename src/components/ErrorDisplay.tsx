import type { PDFLoadError } from '../services/pdfService';

interface ErrorDisplayProps {
  error: PDFLoadError;
  onDismiss?: () => void;
}

const ERROR_TITLES: Record<PDFLoadError['type'], string> = {
  'corrupt': 'Corrupted File',
  'invalid': 'Invalid File Format',
  'not-found': 'File Not Found',
  'unknown': 'Unable to Open File',
};

export function ErrorDisplay({ error, onDismiss }: ErrorDisplayProps) {
  return (
    <div className="error-display" role="alert">
      <div className="error-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2 className="error-title">{ERROR_TITLES[error.type]}</h2>
      <p className="error-message">{error.message}</p>
      {onDismiss && (
        <button className="error-dismiss" onClick={onDismiss}>
          Dismiss
        </button>
      )}
    </div>
  );
}
