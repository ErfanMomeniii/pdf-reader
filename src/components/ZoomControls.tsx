import { useCallback } from 'react';
import { useDocumentStore } from '../stores/documentStore';

const ZOOM_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0];

export function ZoomControls() {
  const { document, zoom, zoomMode, zoomIn, zoomOut, setZoom, setZoomMode, resetZoom } = useDocumentStore();

  const handleZoomChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'fit-width') {
      setZoomMode('fit-width');
    } else if (value === 'fit-page') {
      setZoomMode('fit-page');
    } else {
      const zoomValue = parseFloat(value);
      if (!isNaN(zoomValue)) {
        setZoom(zoomValue);
      }
    }
  }, [setZoom, setZoomMode]);

  if (!document) return null;

  return (
    <div className="zoom-controls">
      <button
        className="zoom-button"
        onClick={zoomOut}
        disabled={zoom <= 0.25}
        aria-label="Zoom out"
        title="Zoom out"
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
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </button>

      <select
        className="zoom-select"
        value={zoomMode !== 'custom' ? zoomMode : zoom.toString()}
        onChange={handleZoomChange}
        aria-label="Zoom level"
      >
        <option value="fit-width">Fit Width</option>
        <option value="fit-page">Fit Page</option>
        <option disabled>───</option>
        {ZOOM_PRESETS.map((preset) => (
          <option key={preset} value={preset}>
            {Math.round(preset * 100)}%
          </option>
        ))}
      </select>

      <button
        className="zoom-button"
        onClick={zoomIn}
        disabled={zoom >= 5.0}
        aria-label="Zoom in"
        title="Zoom in"
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
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="11" y1="8" x2="11" y2="14" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </button>

      <button
        className="zoom-button reset-zoom"
        onClick={resetZoom}
        aria-label="Reset zoom to 100%"
        title="Reset zoom"
      >
        100%
      </button>
    </div>
  );
}
