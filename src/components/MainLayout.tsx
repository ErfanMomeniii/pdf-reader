import { type ReactNode } from 'react';

interface MainLayoutProps {
  toolbar: ReactNode;
  children: ReactNode;
  isDragging?: boolean;
}

export function MainLayout({ toolbar, children, isDragging }: MainLayoutProps) {
  return (
    <div className="main-layout">
      <header className="toolbar-container">
        {toolbar}
      </header>
      <main className="document-container">
        {children}
      </main>
      {isDragging && (
        <div className="drop-overlay">
          <div className="drop-indicator">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="12" y2="12" />
              <line x1="15" y1="15" x2="12" y2="12" />
            </svg>
            <span>Drop PDF file here</span>
          </div>
        </div>
      )}
    </div>
  );
}
