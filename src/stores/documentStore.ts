import { create } from 'zustand';
import type { PDFDocument, PDFLoadError } from '../services/pdfService';

export type ZoomMode = 'custom' | 'fit-width' | 'fit-page';

export interface DocumentState {
  document: PDFDocument | null;
  isLoading: boolean;
  error: PDFLoadError | null;

  currentPage: number;
  zoom: number;
  zoomMode: ZoomMode;
  scrollPosition: { x: number; y: number };

  setDocument: (document: PDFDocument | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: PDFLoadError | null) => void;
  clearError: () => void;

  setCurrentPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToPage: (page: number) => void;

  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setZoomMode: (mode: ZoomMode) => void;
  resetZoom: () => void;

  setScrollPosition: (position: { x: number; y: number }) => void;

  closeDocument: () => void;
}

const ZOOM_STEP = 0.25;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 5.0;

export const useDocumentStore = create<DocumentState>((set, get) => ({
  document: null,
  isLoading: false,
  error: null,

  currentPage: 1,
  zoom: 1.0,
  zoomMode: 'custom',
  scrollPosition: { x: 0, y: 0 },

  setDocument: (document) => set({ document, currentPage: 1, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  clearError: () => set({ error: null }),

  setCurrentPage: (page) => {
    const { document } = get();
    if (!document) return;
    const clampedPage = Math.max(1, Math.min(page, document.numPages));
    set({ currentPage: clampedPage });
  },

  goToNextPage: () => {
    const { document, currentPage } = get();
    if (!document) return;
    if (currentPage < document.numPages) {
      set({ currentPage: currentPage + 1 });
    }
  },

  goToPreviousPage: () => {
    const { currentPage } = get();
    if (currentPage > 1) {
      set({ currentPage: currentPage - 1 });
    }
  },

  goToPage: (page) => {
    const { document } = get();
    if (!document) return;
    const clampedPage = Math.max(1, Math.min(page, document.numPages));
    set({ currentPage: clampedPage });
  },

  setZoom: (zoom) => {
    const clampedZoom = Math.max(MIN_ZOOM, Math.min(zoom, MAX_ZOOM));
    set({ zoom: clampedZoom, zoomMode: 'custom' });
  },

  zoomIn: () => {
    const { zoom } = get();
    const newZoom = Math.min(zoom + ZOOM_STEP, MAX_ZOOM);
    set({ zoom: newZoom, zoomMode: 'custom' });
  },

  zoomOut: () => {
    const { zoom } = get();
    const newZoom = Math.max(zoom - ZOOM_STEP, MIN_ZOOM);
    set({ zoom: newZoom, zoomMode: 'custom' });
  },

  setZoomMode: (mode) => set({ zoomMode: mode }),

  resetZoom: () => set({ zoom: 1.0, zoomMode: 'custom' }),

  setScrollPosition: (position) => set({ scrollPosition: position }),

  closeDocument: () => {
    const { document } = get();
    if (document) {
      document.proxy.destroy();
    }
    set({
      document: null,
      currentPage: 1,
      zoom: 1.0,
      zoomMode: 'custom',
      scrollPosition: { x: 0, y: 0 },
      error: null,
    });
  },
}));
