import { useEffect, useRef, useCallback, memo } from 'react';
import type { PDFPageProxy } from 'pdfjs-dist';

interface PageRendererProps {
  page: PDFPageProxy | null;
  scale: number;
  onRenderComplete?: () => void;
}

export const PageRenderer = memo(function PageRenderer({ page, scale, onRenderComplete }: PageRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<ReturnType<PDFPageProxy['render']> | null>(null);

  const renderPage = useCallback(async () => {
    if (!page || !canvasRef.current) return;

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const viewport = page.getViewport({ scale });
    const outputScale = window.devicePixelRatio || 1;

    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    context.scale(outputScale, outputScale);

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    };

    try {
      renderTaskRef.current = page.render(renderContext as Parameters<typeof page.render>[0]);
      await renderTaskRef.current.promise;
      onRenderComplete?.();
    } catch (err) {
      if ((err as Error).name !== 'RenderingCancelledException') {
        console.error('Error rendering page:', err);
      }
    }
  }, [page, scale, onRenderComplete]);

  useEffect(() => {
    renderPage();

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [renderPage]);

  if (!page) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="pdf-page"
      style={{
        display: 'block',
        margin: '0 auto',
      }}
    />
  );
});
