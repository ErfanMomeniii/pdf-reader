import { useState, useCallback, useEffect } from 'react';
import { useDocumentStore } from '../stores/documentStore';

export function PageNavigation() {
  const { document, currentPage, goToNextPage, goToPreviousPage, goToPage } = useDocumentStore();
  const [inputValue, setInputValue] = useState(String(currentPage));

  // Sync input value when currentPage changes from store
  useEffect(() => {
    setInputValue(String(currentPage));
  }, [currentPage]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleInputBlur = useCallback(() => {
    setInputValue(String(currentPage));
  }, [currentPage]);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const pageNum = parseInt(inputValue, 10);
      if (!isNaN(pageNum)) {
        goToPage(pageNum);
        setInputValue(String(pageNum));
      }
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Escape') {
      setInputValue(String(currentPage));
      (e.target as HTMLInputElement).blur();
    }
  }, [inputValue, currentPage, goToPage]);

  const handlePrevious = useCallback(() => {
    goToPreviousPage();
  }, [goToPreviousPage]);

  const handleNext = useCallback(() => {
    goToNextPage();
  }, [goToNextPage]);

  if (!document) return null;

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === document.numPages;

  return (
    <div className="page-navigation">
      <button
        className="nav-button"
        onClick={handlePrevious}
        disabled={isFirstPage}
        aria-label="Previous page"
        title="Previous page"
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
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div className="page-indicator">
        <input
          type="text"
          className="page-input"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          onFocus={(e) => e.target.select()}
          aria-label="Current page"
        />
        <span className="page-separator">/</span>
        <span className="total-pages">{document.numPages}</span>
      </div>

      <button
        className="nav-button"
        onClick={handleNext}
        disabled={isLastPage}
        aria-label="Next page"
        title="Next page"
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
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
