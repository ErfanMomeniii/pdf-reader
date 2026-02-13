import { useDocumentStore } from '../stores/documentStore';
import { PageNavigation } from './PageNavigation';
import { ZoomControls } from './ZoomControls';
import { useOpenFile } from '../hooks/useOpenFile';

export function Toolbar() {
  const { document } = useDocumentStore();
  const { openDialog } = useOpenFile();

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <button
          className="toolbar-button"
          onClick={openDialog}
          aria-label="Open file"
          title="Open file (Ctrl+O)"
        >
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
            <line x1="12" y1="11" x2="12" y2="17" />
            <line x1="9" y1="14" x2="12" y2="11" />
            <line x1="15" y1="14" x2="12" y2="11" />
          </svg>
        </button>
      </div>

      {document && (
        <>
          <div className="toolbar-center">
            <PageNavigation />
          </div>
          <div className="toolbar-right">
            <ZoomControls />
          </div>
        </>
      )}
    </div>
  );
}
