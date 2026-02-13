import type { PDFPageProxy } from 'pdfjs-dist';

export type RenderQuality = 'low' | 'normal' | 'high';

const QUALITY_MULTIPLIERS: Record<RenderQuality, number> = {
  low: 0.5,
  normal: 1.0,
  high: 2.0,
};

export function getEffectiveScale(baseScale: number, quality: RenderQuality): number {
  return baseScale * QUALITY_MULTIPLIERS[quality];
}

export function getQualityForZoom(zoom: number): RenderQuality {
  if (zoom > 1.5) {
    return 'high';
  }
  if (zoom < 0.75) {
    return 'low';
  }
  return 'normal';
}

export interface RenderOptions {
  scale: number;
  quality?: RenderQuality;
}

export async function renderPageToCanvas(
  page: PDFPageProxy,
  canvas: HTMLCanvasElement,
  options: RenderOptions
): Promise<void> {
  const { scale, quality = 'normal' } = options;
  const effectiveScale = getEffectiveScale(scale, quality);

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Could not get canvas context');
  }

  const viewport = page.getViewport({ scale: effectiveScale });
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

  const renderTask = page.render(renderContext as Parameters<typeof page.render>[0]);
  await renderTask.promise;
}

export async function renderThumbnail(
  page: PDFPageProxy,
  maxWidth: number = 150
): Promise<HTMLCanvasElement> {
  const viewport = page.getViewport({ scale: 1.0 });
  const scale = maxWidth / viewport.width;

  const canvas = document.createElement('canvas');
  await renderPageToCanvas(page, canvas, { scale, quality: 'low' });

  return canvas;
}
